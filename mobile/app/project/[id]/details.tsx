import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/hooks/use-user';
import {
  getProjectDetail,
  getUserProjects,
  getProjectComments,
  postComment,
  type ProjectDetail,
  type Comment,
} from '@/services/api';
import { CircularProgress } from '@/components/circular-progress';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

function formatLastWorked(dateStr: string | null): string {
  if (!dateStr) return 'Not started';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUser();
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [rowsCompleted, setRowsCompleted] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getProjectComments(id);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (!id || !userId) return;
      (async () => {
        try {
          const [detail, userProjects] = await Promise.all([
            getProjectDetail(id),
            getUserProjects(userId),
            fetchComments(),
          ]);
          setProject(detail);
          const myProject = userProjects.find((p) => p.id === id);
          setRowsCompleted(myProject?.rows_completed ?? 0);
        } catch (err) {
          console.error('Failed to fetch project detail:', err);
        } finally {
          setLoading(false);
        }
      })();
    }, [id, userId, fetchComments])
  );

  const handlePostComment = async () => {
    if (!id || !userId || !commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await postComment(id, userId, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={YarnyColors.button} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Project not found</Text>
      </SafeAreaView>
    );
  }

  const totalRows = project.total_rows ?? 0;
  const overallPercent = totalRows > 0 ? (rowsCompleted / totalRows) * 100 : 0;

  // Compute per-section progress
  const sectionProgress = project.sections.map((section) => {
    const sectionRowCount = section.rows.length;
    const completedInSection = section.rows.filter((r) => r.position <= rowsCompleted).length;
    const percent = sectionRowCount > 0 ? (completedInSection / sectionRowCount) * 100 : 0;
    return { ...section, percent };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={24} color={YarnyColors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{project.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Overview */}
        <Text style={styles.sectionHeader}>Overview</Text>
        <View style={styles.overviewCard}>
          {project.image_url ? (
            <Image source={{ uri: project.image_url }} style={styles.overviewImage} />
          ) : (
            <View style={[styles.overviewImage, { backgroundColor: YarnyColors.border }]} />
          )}
          <View style={styles.overviewInfo}>
            <View style={styles.overviewRow}>
              <CircularProgress percent={overallPercent} size={44} />
              <Text style={styles.overviewText}>complete</Text>
            </View>
            <View style={styles.overviewRow}>
              <IconSymbol name="house.fill" size={18} color={YarnyColors.textPrimary} />
              <Text style={styles.overviewText}>
                last worked {formatLastWorked(project.last_worked_at)}
              </Text>
            </View>
            <View style={styles.overviewRow}>
              <IconSymbol name="person.fill" size={18} color={YarnyColors.textPrimary} />
              <Text style={styles.overviewText}>
                {project.is_public ? 'public project' : 'private project'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        <Text style={styles.sectionHeader}>Sections</Text>
        {sectionProgress.map((section) => (
          <View key={section.id} style={styles.sectionRow}>
            <CircularProgress percent={section.percent} size={40} strokeWidth={3} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        ))}

        {/* Comments */}
        <Text style={styles.sectionHeader}>Comments</Text>
        {comments.length === 0 ? (
          <Text style={styles.emptyComments}>No comments yet</Text>
        ) : (
          comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
              <Text style={styles.commentAuthor}>{c.username}</Text>
              <Text style={styles.commentBody}>{c.body}</Text>
            </View>
          ))
        )}
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={YarnyColors.border}
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!commentText.trim() || submitting) && styles.buttonDisabled]}
            onPress={handlePostComment}
            disabled={!commentText.trim() || submitting}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YarnyColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: YarnyColors.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.subtitle,
    color: YarnyColors.textSecondary,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.subtitle,
    color: YarnyColors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
    borderBottomWidth: 2,
    borderBottomColor: YarnyColors.button,
    paddingBottom: 4,
  },
  overviewCard: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  overviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  overviewInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    gap: 6,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewText: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: YarnyColors.border,
  },
  sectionTitle: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
  },
  emptyComments: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
    opacity: 0.6,
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: YarnyColors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  commentAuthor: {
    fontFamily: YarnyFonts.bodySemiBold,
    fontSize: YarnySizes.caption,
    color: YarnyColors.textSecondary,
    marginBottom: 2,
  },
  commentBody: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
    borderWidth: 1,
    borderColor: YarnyColors.border,
  },
  sendButton: {
    backgroundColor: YarnyColors.button,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontFamily: YarnyFonts.bodySemiBold,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
    textAlign: 'center',
    marginTop: 40,
  },
});

/**
 * Groups API
 *
 * Community groups in this product are allergen groups.
 * There is no standalone "create group" endpoint — a group is created by
 * adding an allergy via POST /allergies.  The backend stores the allergen
 * record and the community module surfaces it as a Group.
 *
 * Delete operations (posts / comments) go through the community routes.
 */

import { apiClient } from './client'
import { Group, CreateGroupInput } from '@/types/groups'

class GroupsApi {
    async getAllGroups(): Promise<Group[]> {
        const response = await apiClient.get<{ success: boolean; data: { groups: Group[] } }>(
            '/community/groups',
        )
        return response.data.groups
    }

    async getGroupPosts(groupId: string, page = 1, limit = 20) {
        const response = await apiClient.get<{ success: boolean; data: any }>(
            `/community/groups/${groupId}/posts`,
            { params: { page, limit } },
        )
        return response.data
    }

    /**
     * Creates a new allergen group.
     *
     * Backend design: groups === allergens.  A group is created by POSTing
     * to /allergies and the returned allergy record is the group.
     */
    async createGroup(data: CreateGroupInput): Promise<Group> {
        const response = await apiClient.post<{
            success: boolean
            data: { allergy: Record<string, unknown> }
            message: string
        }>('/allergies', data)

        const allergy = response.data?.allergy
        if (!allergy) {
            throw new Error('createGroup: unexpected response shape from /allergies')
        }

        return {
            ...allergy,
            postCount: 0,
            participantCount: 0,
        } as Group
    }

    async deletePost(postId: string): Promise<boolean> {
        const response = await apiClient.delete<{ success: boolean; message: string }>(
            `/community/groups/posts/${postId}`,
        )
        return response.success
    }

    async deleteComment(commentId: string): Promise<boolean> {
        const response = await apiClient.delete<{ success: boolean; message: string }>(
            `/community/groups/comments/${commentId}`,
        )
        return response.success
    }
}

export const groupsApi = new GroupsApi()

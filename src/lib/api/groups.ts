import { apiClient } from './client'
import { Group, GroupPost, GroupsFilters, CreateGroupInput } from '@/types/groups'

class GroupsApi {
    async getAllGroups() {
        const response = await apiClient.get<{ success: boolean; data: { groups: Group[] } }>('/community/groups')
        return response.data.groups
    }

    async getGroupPosts(groupId: string, page = 1, limit = 20) {
        const response = await apiClient.get<{ success: boolean; data: any }>(`/community/groups/${groupId}/posts`, {
            params: { page, limit }
        })
        return response.data
    }

    async createGroup(data: CreateGroupInput): Promise<Group> {
        const response = await apiClient.post<{ success: boolean; data: { allergy: any }; message: string }>('/allergies', data)
        return {
            ...response.data.allergy,
            postCount: 0,
            participantCount: 0
        } as Group
    }
}

export const groupsApi = new GroupsApi()

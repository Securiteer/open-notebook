import { apiClient } from './client';
import { Skill, SkillCreate, SkillRateRequest } from '../types/skills';

export const skillsApi = {
  getSkills: async () => {
    const res = await apiClient.get<Skill[]>('/skills');
    return res.data;
  },

  getInstalledSkills: async () => {
    const res = await apiClient.get<Skill[]>('/skills/installed');
    return res.data;
  },

  getSkill: async (id: string) => {
    const res = await apiClient.get<Skill>(`/skills/${id}`);
    return res.data;
  },

  uploadSkill: async (file: File, metadata: Partial<SkillCreate>) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.name) formData.append('name', metadata.name);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.author) formData.append('author', metadata.author);
    if (metadata.version) formData.append('version', metadata.version);
    if (metadata.instructions) formData.append('instructions', metadata.instructions);

    const res = await apiClient.post<Skill>('/skills/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  installSkill: async (id: string) => {
    const res = await apiClient.post<{ status: string }>(`/skills/${id}/install`, {});
    return res.data;
  },

  uninstallSkill: async (id: string) => {
    const res = await apiClient.delete<{ status: string }>(`/skills/${id}/uninstall`);
    return res.data;
  },

  rateSkill: async (id: string, data: SkillRateRequest) => {
    const res = await apiClient.post<Skill>(`/skills/${id}/rate`, data);
    return res.data;
  },
};

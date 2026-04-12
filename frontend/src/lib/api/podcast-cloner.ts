import { apiClient } from './client';

export interface PodcastClonerRequest {
  podcast_name: string;
  num_episodes?: number;
}

export interface PodcastClonerResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
  result?: {
    success: boolean;
    episode_profile_id?: string;
    speaker_profile_id?: string;
    style_prompt?: string;
    processing_time: number;
    error_message?: string;
  };
  error_message?: string;
}

export const podcastClonerApi = {
  submitJob: async (request: PodcastClonerRequest): Promise<PodcastClonerResponse> => {
    return await apiClient.post<PodcastClonerResponse>('/podcast-cloner/submit', request);
  },

  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    return await apiClient.get<JobStatusResponse>(`/podcast-cloner/jobs/${jobId}`);
  },
};

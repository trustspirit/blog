import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostDto {
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  published: boolean;
}

export interface UpdateBlogPostDto extends Partial<CreateBlogPostDto> {}

export interface AboutInfo {
  id: string;
  content: string;
  updatedAt: string;
}

export const blogApi = {
  getPosts: async (
    page: number = 1,
    limit: number = 10,
    includeDrafts: boolean = false
  ) => {
    const response = await api.get("/posts", {
      params: { page, limit, includeDrafts },
    });
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  getPostForAdmin: async (id: string) => {
    const response = await api.get(`/posts/admin/${id}`);
    return response.data;
  },

  createPost: async (data: CreateBlogPostDto) => {
    const response = await api.post("/posts", data);
    return response.data;
  },

  updatePost: async (id: string, data: UpdateBlogPostDto) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  getAbout: async () => {
    const response = await api.get("/about");
    return response.data;
  },

  updateAbout: async (content: string) => {
    const response = await api.put("/about", { content });
    return response.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    // Axios automatically sets Content-Type with boundary for FormData
    // Do not manually set Content-Type header
    const response = await api.post("/uploads/image", formData);
    return response.data.url;
  },
};

export const authApi = {
  loginWithGoogle: async (token: string) => {
    const response = await api.post("/auth/google", { token });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

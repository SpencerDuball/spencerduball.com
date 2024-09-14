export interface IUserWithRoles {
  id: string;
  github_id: number;
  username: string;
  name: string;
  avatar_url: string;
  github_url: string;
  created_at: Date;
  modified_at: Date;
  roles: string[];
}

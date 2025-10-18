export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RegisterDto = {
  email: string;
  passoword: string;
  name: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

// レスポンスDTOではパスワードを絶対に含めない
export type UserResponseDto = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
};

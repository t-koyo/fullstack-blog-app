import { RegisterDto, User } from "../types/user";
import { v4 as uuidv4 } from "uuid";

class UserRepository {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((users) => users.email === email) || null;
  }

  async create(data: RegisterDto & { hashedPassword: string }): Promise<User> {
    const now = new Date();

    const user: User = {
      id: uuidv4(),
      email: data.email,
      password: data.hashedPassword,
      name: data.name,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    const now = new Date();
    this.users[index] = {
      ...this.users[index],
      ...data,
      updatedAt: now,
    };

    return this.users[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }
}

export const userRepository = new UserRepository();

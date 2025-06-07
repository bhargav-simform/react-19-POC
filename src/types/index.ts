export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

export interface List {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  lists: List[];
}

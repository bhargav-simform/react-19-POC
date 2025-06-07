import { useState, useTransition } from 'react';
import { useOptimistic, useActionState } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { Button, Input, Space, Spin } from 'antd';
import { Task } from './Task';
import type { List as ListType, Task as TaskType } from '../types';

interface ListProps {
  list: ListType;
  onAddTask: (listId: string, task: TaskType) => void;
  onMoveTask: (taskId: string, sourceListId: string, targetListId: string) => void;
}

const ListContainer = styled.div<{ $isDraggingOver: boolean }>`
  width: 300px;
  margin: 0 8px;
  height: 100%;
  background: ${props => (props.$isDraggingOver ? '#e6f7ff' : '#f0f2f5')};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s ease;
`;

const ListHeader = styled.div`
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskList = styled.div`
  padding: 0 12px;
  flex: 1;
  overflow-y: auto;
  min-height: 100px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
`;

export function List({ list, onAddTask, onMoveTask }: ListProps) {
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    list.tasks,
    (currentTasks: TaskType[], newTask: TaskType) => [...currentTasks, newTask]
  );

  const [formState, submitAction] = useActionState<
    { error: string | null },
    { title: string; id: string }
  >(
    async (_prevState, formData) => {
      const { title, id } = formData;
      if (!title.trim()) return { error: 'Title required' };

      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTask: TaskType = {
        id,
        title: title.trim(),
        createdAt: new Date(),
      };
      
      addOptimisticTask(newTask);
      onAddTask(list.id, newTask);
      return { error: null };
    },
    { error: null }
  );

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isPending, startTransition] = useTransition();

  const [{ isOver }, dropRef] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string; listId: string }) => {
      if (item.listId !== list.id) {
        startTransition(() => {
          onMoveTask(item.id, item.listId, list.id);
        });
      }
    },
    collect: (monitor: { isOver: () => boolean }) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    
    startTransition(() => {
      submitAction({ title: newTaskTitle, id });
    });
  };

  return (
    <ListContainer ref={dropRef} $isDraggingOver={isOver}>
      <ListHeader>
        <h3 style={{ margin: 0, fontSize: '16px' }}>{list.title}</h3>
        <span style={{ 
          backgroundColor: '#e6e6e6', 
          padding: '2px 8px', 
          borderRadius: '10px', 
          fontSize: '12px' 
        }}>
          {optimisticTasks.length}
        </span>
      </ListHeader>
      
      <TaskList>
        {optimisticTasks.map((task) => (
          <Task key={task.id} task={task} listId={list.id} />
        ))}
      </TaskList>

      <div style={{ padding: '12px' }}>
        <form onSubmit={handleSubmit}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {isPending && (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <Spin size="small" />
                <span style={{ marginLeft: 8 }}>Adding task...</span>
              </div>
            )}
            {formState?.error && (
              <div style={{ color: 'red' }}>{formState.error}</div>
            )}
            <Input.TextArea
              name="title"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 6 }}
              autoFocus
              disabled={isPending}
            />
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isPending}
                disabled={isPending || !newTaskTitle.trim()}
              >
                {isPending ? 'Adding...' : 'Add Task'}
              </Button>
              <Button 
                onClick={() => setNewTaskTitle('')} 
                disabled={isPending}
              >
                Cancel
              </Button>
            </Space>
          </Space>
        </form>
      </div>
    </ListContainer>
  );
}

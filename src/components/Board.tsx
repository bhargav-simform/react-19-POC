import { useState, useTransition } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import styled from 'styled-components';
import { Input, Button, Space, Spin } from 'antd';
import { List } from './List';
import type { Board as BoardType, List as ListType, Task as TaskType } from '../types';
import { useOptimistic, useActionState } from 'react';

const BoardContainer = styled.div`
  height: 100%;
  padding: 20px;
  overflow-x: auto;
  background: #f7f9fc;
`;

const ListsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  height: 100%;
`;

const AddListContainer = styled.div`
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  width: 300px;
  margin: 0 8px;
  padding: 12px;
`;

interface BoardProps {
  board: BoardType;
  isPending: boolean
  onAddList: (title: string) => void;
  onAddTask: (listId: string, task: TaskType) => void;
  onMoveTask: (taskId: string, sourceListId: string, targetListId: string) => void;
}

export function Board({ board, onAddList, onAddTask, onMoveTask, isPending: isPendingTaskAdd }: BoardProps) {
  const [optimisticLists, addOptimisticList] = useOptimistic(
    board.lists,
    (currentLists: ListType[], newList: ListType) => [...currentLists, newList]
  );

  const [formState, submitAction] = useActionState<
    { error: string | null },
    { title: string; id: string }
  >(
    async (_prevState, formData) => {
      const title = formData.title.trim();
      if (!title) return { error: 'Title required' };

      await new Promise(resolve => setTimeout(resolve, 1000));
      const newList: ListType = {
        id: formData.id,
        title: formData.title,
        tasks: [],
      };
      
      addOptimisticList(newList);
      onAddList(title);
      return { error: null };
    },
    { error: null }
  );

  const [newListTitle, setNewListTitle] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    
    startTransition(() => {
      submitAction({ title: newListTitle, id });
    });
    
    setNewListTitle('');
  };

  return (
    <ReactDndProvider backend={HTML5Backend}>
      <BoardContainer>
        <ListsContainer>
          {optimisticLists.map((list: ListType) => (
            <List
              key={list.id}
              list={list}
              onAddTask={onAddTask}
              onMoveTask={onMoveTask}
            />
          ))}

          <AddListContainer>
              <form onSubmit={handleSubmit}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {isPending && (
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                      <Spin size="small" />
                      <span style={{ marginLeft: 8 }}>Adding list...</span>
                    </div>
                  )}
                  {formState?.error && (
                    <div style={{ color: 'red' }}>{formState.error}</div>
                  )}
                  <Input
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    autoFocus
                    disabled={isPending}
                  />
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={isPending}
                      disabled={isPending || !newListTitle.trim() || isPendingTaskAdd}
                    >
                      {(isPendingTaskAdd ?? isPendingTaskAdd) ? 'Adding...' : 'Add List'}
                    </Button>
                  </Space>
                </Space>
              </form>
          </AddListContainer>
        </ListsContainer>
      </BoardContainer>
    </ReactDndProvider>
  );
}

import { createContext, useEffect, useOptimistic, useState, useTransition } from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';
import { Board } from './components/Board';
import type { Board as BoardType, List, Task } from './types';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ParentComponent } from './components/ParentComponent';

const { Header, Content } = Layout;

const StyledHeader = styled(Header)`
  background: #1d2125;
  padding: 0 24px;
  line-height: 64px;
  display: flex;
  align-items: center;
`;

const AppTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 20px;
`;

const StyledContent = styled(Content)`
  height: calc(100vh - 64px);
`;

const STORAGE_KEY = 'task-management-data';

function App() {
  const ThemeContext = createContext('');

  const [board, setBoard] = useState<BoardType>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : { lists: [] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const [optimisticBoard, addOptimisticUpdate] = useOptimistic(
    board,
    (current: BoardType, updater: (prev: BoardType) => BoardType) => updater(current)
  );

  const [isPending, startTransition] = useTransition();

  const handleAddList = (title: string) => {
    const newList: List = {
      id: crypto.randomUUID(),
      title,
      tasks: [],
    };

    startTransition(() => {
      addOptimisticUpdate((prev) => ({
        ...prev,
        lists: [...prev.lists, newList],
      }));

      setBoard((prev) => ({
        ...prev,
        lists: [...prev.lists, newList],
      }));
    });
  };

  const handleAddTask = (listId: string, task: Task) => {
    startTransition(() => {
      addOptimisticUpdate((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId
            ? { ...list, tasks: [...list.tasks, task] }
            : list
        ),
      }));

      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId
            ? { ...list, tasks: [...list.tasks, task] }
            : list
        ),
      }));
    });
  };

  const handleMoveTask = (taskId: string, sourceListId: string, targetListId: string) => {
    startTransition(() => {
      const sourceList = board.lists.find((l) => l.id === sourceListId);
      const task = sourceList?.tasks.find((t) => t.id === taskId);
      if (!sourceList || !task) return;

      addOptimisticUpdate((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => {
          if (list.id === sourceListId) {
            return {
              ...list,
              tasks: list.tasks.filter((t) => t.id !== taskId),
            };
          }
          if (list.id === targetListId) {
            return {
              ...list,
              tasks: [...list.tasks, task],
            };
          }
          return list;
        }),
      }));

      setBoard((prev) => {
        const sourceList = prev.lists.find((l) => l.id === sourceListId);
        const task = sourceList?.tasks.find((t) => t.id === taskId);
        if (!sourceList || !task) return prev;

        return {
          ...prev,
          lists: prev.lists.map((list) => {
            if (list.id === sourceListId) {
              return {
                ...list,
                tasks: list.tasks.filter((t) => t.id !== taskId),
              };
            }
            if (list.id === targetListId) {
              return {
                ...list,
                tasks: [...list.tasks, task],
              };
            }
            return list;
          }),
        };
      });
    });
  };

  // Here for context no need to use Provider in Wrapping component
  return (
  <ThemeContext value='black'>
      <Layout style={{ minHeight: '100vh' }}>
        <StyledHeader>
          <AppTitle>Task Management</AppTitle>
        </StyledHeader>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={
              <StyledContent>
                <Board
                  isPending={isPending}
                  board={optimisticBoard}
                  onAddList={handleAddList}
                  onAddTask={handleAddTask}
                  onMoveTask={handleMoveTask}
                  />
              </StyledContent>
            } />
            <Route path="/ref-demo" element={
              <StyledContent>
                <ParentComponent />
              </StyledContent>} />
          </Routes>
        </BrowserRouter>
      </Layout>
  </ThemeContext>
  );
}

export default App;

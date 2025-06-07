import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import { Card } from 'antd';
import type { Task as TaskType } from '../types';

interface TaskProps {
  task: TaskType;
  listId: string;
}

const StyledCard = styled(Card)`
  margin-bottom: 8px;
  cursor: grab;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  user-select: none;

  &:hover {
    background-color: #f5f5f5;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    cursor: grabbing;
  }

  .ant-card-body {
    padding: 12px;
  }
`;

interface DragObject {
  id: string;
  listId: string;
  type: string;
}

export function Task({ task, listId }: TaskProps) {
  const [{ isDragging }, dragRef] = useDrag<DragObject, unknown, { isDragging: boolean }>(() => ({
    type: 'TASK',
    item: { id: task.id, listId, type: 'TASK' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [task.id, listId]);

  return (
    <div
      ref={dragRef as React.RefObject<HTMLDivElement>}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      aria-grabbed={isDragging}
      role="button"
      tabIndex={0}
    >
      <StyledCard size="small" bordered={false}>
        <h4 style={{ margin: 0, fontSize: 14 }}>{task.title}</h4>
        {task.description && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>
            {task.description}
          </p>
        )}
      </StyledCard>
    </div>
  );
}

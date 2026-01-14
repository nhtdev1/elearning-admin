import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';

export default function SortableItem({ id, children, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        touchAction: 'none' // Prevent scrolling on mobile while dragging if desirable, though dnd-kit usually handles via sensors
    };

    return (
        <Box ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ mb: 2 }}>
            {children}
        </Box>
    );
}

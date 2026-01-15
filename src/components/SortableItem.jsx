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
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 999 : 'auto', // Lift up
        boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.25)' : 'none', // Shadow
        border: isDragging ? '2px solid #1976d2' : '1px solid transparent', // Highlight border (Primary Blue)
        backgroundColor: isDragging ? '#ffffff' : 'inherit', // Background to cover underlying items
        borderRadius: '8px', // Rounded corners
        position: 'relative',
        touchAction: 'none' // Prevent scrolling on mobile while dragging if desirable, though dnd-kit usually handles via sensors
    };

    return (
        <Box ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ mb: 2 }}>
            {children}
        </Box>
    );
}

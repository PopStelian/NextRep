/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from './Dashboard';
import { BrowserRouter } from 'react-router-dom';

describe('Dashboard Comprehensive Tests', () => {
    let mockExercises;
    let setExercises;

    beforeEach(() => {
        // Mock data pentru teste
        mockExercises = [
            { id: 1, name: 'Bench Press', muscle: 'Chest', sets: 4, reps: 10 }
        ];
        setExercises = vi.fn();

        // Mock pentru funcțiile browser-ului care nu există în JSDOM
        window.alert = vi.fn();
        window.confirm = vi.fn(() => true);
        window.scrollTo = vi.fn(); // Previne erori la handleEditClick
    });

    afterEach(() => {
        cleanup();
    });

    it('1. CREATE: Should add a new exercise when form is valid', () => {
        render(
            <BrowserRouter>
                <Dashboard exercises={[]} setExercises={setExercises} />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Exercise Name/i), { target: { value: 'Pushups' } });
        fireEvent.change(screen.getByPlaceholderText(/Muscle Group/i), { target: { value: 'Chest' } });
        fireEvent.change(screen.getByPlaceholderText(/Sets/i), { target: { value: '3' } });
        fireEvent.change(screen.getByPlaceholderText(/Reps/i), { target: { value: '15' } });

        fireEvent.click(screen.getByText(/Save/i));
        expect(setExercises).toHaveBeenCalled();
    });

    it('2. VALIDATION: Should NOT add exercise if name is empty', () => {
        render(
            <BrowserRouter>
                <Dashboard exercises={[]} setExercises={setExercises} />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText(/Save/i));
        expect(setExercises).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Validare eșuată"));
    });

    it('3. DELETE: Should trigger delete when button is clicked', () => {
        render(
            <BrowserRouter>
                <Dashboard exercises={mockExercises} setExercises={setExercises} />
            </BrowserRouter>
        );

        const deleteButton = screen.getByText(/Delete/i);
        fireEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalled();
        expect(setExercises).toHaveBeenCalled();
    });

    it('4. SEARCH: Should filter items in the table', () => {
        render(
            <BrowserRouter>
                <Dashboard exercises={mockExercises} setExercises={setExercises} />
            </BrowserRouter>
        );

        const searchInput = screen.getByPlaceholderText(/Search exercises/i);
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

        const row = screen.queryByText(/Bench Press/i);
        expect(row).toBeNull();
    });

    it('5. EDIT: Should enter edit mode and update exercise', () => {
        render(
            <BrowserRouter>
                <Dashboard exercises={mockExercises} setExercises={setExercises} />
            </BrowserRouter>
        );

        // Click pe Edit
        fireEvent.click(screen.getByText(/Edit/i));

        // Verificăm dacă titlul formularului s-a schimbat
        expect(screen.getByText(/Edit Mode/i)).toBeDefined();

        // Modificăm numele
        fireEvent.change(screen.getByPlaceholderText(/Exercise Name/i), { target: { value: 'Updated Name' } });

        // Click pe Update (butonul își schimbă textul din Save în Update în codul tău)
        fireEvent.click(screen.getByText(/Update/i));

        expect(setExercises).toHaveBeenCalled();
    });

    it('6. CANCEL: Should exit edit mode when cancel is clicked', () => {
        render(
            <BrowserRouter>
                <Dashboard exercises={mockExercises} setExercises={setExercises} />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText(/Edit/i));
        const cancelButton = screen.getByText(/Cancel/i);
        fireEvent.click(cancelButton);

        // Verificăm dacă a revenit la "Add New Exercise"
        expect(screen.getByText(/Add New Exercise/i)).toBeDefined();
    });
});
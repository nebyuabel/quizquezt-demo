"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function StudyChecklist() {
  const { user } = useAuth();
  const supabase = createClient();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("todos")
      .select("id, title, completed, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4); // max 4 active tasks

    if (error) {
      console.error("Error fetching todos:", error);
      return;
    }
    setTodos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const addTodo = async () => {
    if (!user) return;
    if (!newTodoTitle.trim()) {
      setError("Task cannot be empty.");
      return;
    }
    // Check if already have 4 active tasks (max)
    const activeCount = todos.filter((t) => !t.completed).length;
    if (activeCount >= 4) {
      setError("Maximum 4 active tasks allowed.");
      return;
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        title: newTodoTitle.trim(),
        completed: false,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }
    setTodos((prev) => [data, ...prev]);
    setNewTodoTitle("");
    setShowAddInput(false);
    setError(null);
  };

  const toggleTodo = async (todo: Todo) => {
    if (todo.completed) return; // already completed, no need to toggle back (or you can allow un-complete? We'll keep it one-way for XP).

    // Call RPC to complete the todo
    const { data, error } = await supabase.rpc("complete_todo", {
      p_todo_id: todo.id,
      p_user_id: user?.id,
    });

    if (error) {
      console.error("Error completing todo:", error);
      setError(error.message);
      return;
    }

    if (data?.success) {
      // Update local state
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: true } : t)),
      );
      // Optionally show a toast for XP gained
    } else {
      setError(data?.message || "Failed to complete task.");
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", todoId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting todo:", error);
      setError(error.message);
      return;
    }
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  if (loading) {
    return (
      <div className="bg-surface-container rounded-xl p-md shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-32 bg-surface-variant rounded"></div>
          <div className="h-12 bg-surface-variant rounded"></div>
          <div className="h-12 bg-surface-variant rounded"></div>
        </div>
      </div>
    );
  }

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const canAddMore = activeTodos.length < 4;

  return (
    <div className="bg-surface-container rounded-xl p-md shadow-md">
      <div className="flex items-center justify-between mb-xs">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-tertiary">
            task_alt
          </span>
          Study Checklist
        </h2>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {activeTodos.length}/4 active
        </span>
      </div>

      {error && (
        <div className="mb-2 text-error text-sm bg-error/10 p-2 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-base">
        {todos.length === 0 ? (
          <p className="text-text-muted text-sm py-2">
            No tasks. Add one to get started!
          </p>
        ) : (
          <>
            {activeTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-sm p-sm rounded-lg bg-surface hover:bg-surface-variant transition-colors group"
              >
                <button
                  onClick={() => toggleTodo(todo)}
                  className="relative flex items-center justify-center w-6 h-6 mt-0.5 flex-shrink-0"
                >
                  <div className="w-5 h-5 rounded border-2 border-outline-variant hover:border-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                      check
                    </span>
                  </div>
                </button>
                <div className="flex-1">
                  <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            ))}
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-sm p-sm rounded-lg bg-surface-container-low opacity-70"
              >
                <div className="w-6 h-6 mt-0.5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-success-green text-[18px]">
                    check_circle
                  </span>
                </div>
                <div className="flex-1">
                  <span className="font-body-md text-body-md text-on-surface-variant line-through">
                    {todo.title}
                  </span>
                  <span className="font-label-sm text-label-sm text-success-green flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">
                      local_fire_department
                    </span>
                    +1 XP & +5 Coins
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 hover:opacity-100 transition-opacity text-text-muted hover:text-error"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            ))}
          </>
        )}

        {showAddInput ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Enter task..."
              className="flex-1 bg-[#14141A] text-on-surface font-body-md text-body-md p-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow w-full shadow-inner"
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
                if (e.key === "Escape") {
                  setShowAddInput(false);
                  setNewTodoTitle("");
                  setError(null);
                }
              }}
              autoFocus
            />
            <button
              onClick={addTodo}
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md hover:opacity-80 transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddInput(false);
                setNewTodoTitle("");
                setError(null);
              }}
              className="text-text-muted hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        ) : (
          canAddMore && (
            <button
              onClick={() => setShowAddInput(true)}
              className="mt-2 text-primary text-sm flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Task
            </button>
          )
        )}
        {!canAddMore && todos.length > 0 && (
          <p className="text-text-muted text-xs mt-1">
            Maximum 4 active tasks reached.
          </p>
        )}
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (!user) return;

    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("id, title, completed, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching todos:", error);
        setLoading(false);
        return;
      }

      setTodos(data || []);
      setLoading(false);
    };

    fetchTodos();
  }, [user, supabase]);

  const toggleTodo = async (todo: Todo) => {
    const newCompleted = !todo.completed;
    const { error } = await supabase
      .from("todos")
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq("id", todo.id);

    if (error) {
      console.error("Error updating todo:", error);
      return;
    }

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: newCompleted } : t,
      ),
    );

    // Award XP if completed
    if (newCompleted) {
      // We should call a server function to award XP (idempotent)
      // For now, we'll just update UI; we'll implement the server function later
    }
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

  return (
    <div className="bg-surface-container rounded-xl p-md shadow-md">
      <div className="flex items-center justify-between mb-xs">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-tertiary">
            task_alt
          </span>
          Study Checklist
        </h2>
      </div>
      <div className="flex flex-col gap-base">
        {todos.length === 0 ? (
          <p className="text-text-muted text-sm">
            No tasks. Add one to get started!
          </p>
        ) : (
          todos.map((todo) => (
            <label
              key={todo.id}
              className="flex items-start gap-sm p-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded bg-surface-container-highest peer-checked:bg-success-green transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-surface-container-highest peer-checked:text-on-primary-container opacity-0 peer-checked:opacity-100 transition-opacity">
                    check
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-body-md text-body-md ${todo.completed ? "text-on-surface-variant line-through" : "text-on-surface group-hover:text-primary transition-colors"}`}
                >
                  {todo.title}
                </span>
                {todo.completed && (
                  <span className="font-label-sm text-label-sm text-success-green flex items-center gap-base">
                    <span className="material-symbols-outlined text-[14px]">
                      local_fire_department
                    </span>
                    +1 XP
                  </span>
                )}
              </div>
            </label>
          ))
        )}
        <button className="mt-2 text-primary text-sm flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Task
        </button>
      </div>
    </div>
  );
}

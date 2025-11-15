import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  getDocs,
} from "firebase/firestore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trash2 } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  user: User;
}

export const TodoList = ({ user }: TodoListProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "users", user.uid, "todos"));
      getDocs(q).then((querySnapshot) => {
        const todosData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Todo)
        );
        setTodos(todosData);
      });
    }
  }, [user]);

  const addTodo = async () => {
    if (newTodo.trim() === "" || !user) return;
    const docRef = await addDoc(collection(db, "users", user.uid, "todos"), {
      text: newTodo,
      completed: false,
    });
    setTodos([...todos, { id: docRef.id, text: newTodo, completed: false }]);
    setNewTodo("");
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!user) return;
    const todoRef = doc(db, "users", user.uid, "todos", id);
    await updateDoc(todoRef, { completed: !completed });
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      )
    );
  };

  const removeTodo = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "todos", id));
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
          />
          <Button onClick={addTodo}>Add</Button>
        </div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span
                className={todo.completed ? "line-through text-muted-foreground" : ""}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTodo(todo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

"use client";

import { useFormState } from "react-dom";
import { createUser } from "@/app/api/user/action";

const initialState = {} as any;

export default function UserForm() {
  const [state, formAction] = useFormState(createUser, initialState);

  return (
    <form action={formAction}>
      <input name="username" placeholder="username" />
      <input name="password" placeholder="password" />
      <input name="email" placeholder="email" />
      <input name="phone" placeholder="phone" />

      {state?.error && <p style={{ color: "red" }}>{state.error}</p>}

      <button type="submit">创建用户</button>
    </form>
  );
}

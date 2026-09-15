"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Button, Input } from "@tcg/ui";
import { signInAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  const [state, formAction] = useFormState(signInAction, initialState);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Connexion</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <Input type="email" name="email" placeholder="Email" required autoComplete="email" />
        <Input
          type="password"
          name="password"
          placeholder="Mot de passe"
          required
          autoComplete="current-password"
        />
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <Button type="submit">Se connecter</Button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-surface-500">
        <Link href="/forgot-password" className="hover:text-brand-600">
          Mot de passe oublié ?
        </Link>
        <Link href="/signup" className="hover:text-brand-600">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}

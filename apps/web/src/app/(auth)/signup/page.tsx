"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Button, Input } from "@tcg/ui";
import { signUpAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { error: null };

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUpAction, initialState);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Créer un compte</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <Input name="username" placeholder="Nom d'utilisateur" required autoComplete="username" minLength={3} />
        <Input type="email" name="email" placeholder="Email" required autoComplete="email" />
        <Input
          type="password"
          name="password"
          placeholder="Mot de passe (8 caractères min.)"
          required
          autoComplete="new-password"
          minLength={8}
        />
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <Button type="submit">S&apos;inscrire</Button>
      </form>
      <p className="mt-4 text-sm text-surface-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

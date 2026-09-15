"use client";

import { useFormState } from "react-dom";
import { Button, Input } from "@tcg/ui";
import { forgotPasswordAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { error: null };

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Mot de passe oublié</h1>
      <p className="mb-6 text-sm text-surface-500">
        Recevez un lien de réinitialisation par email.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <Input type="email" name="email" placeholder="Email" required autoComplete="email" />
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <Button type="submit">Envoyer le lien</Button>
      </form>
    </div>
  );
}

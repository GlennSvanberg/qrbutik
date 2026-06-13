import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../lib/devMagicLink'

type LoginFormProps = {
  redirectTo?: string
  title?: string
  description?: string
  showCreateLink?: boolean
}

export function LoginForm({
  redirectTo = '/admin',
  title = 'Logga in',
  description = 'Logga in med e-post — vi skickar en säker länk. Inget lösenord.',
  showCreateLink = true,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  return (
    <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-6 p-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          QRButik.se
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </header>

      <form
        className="flex flex-col gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          setStatusMessage(null)
          setErrorMessage(null)
          const trimmedEmail = email.trim()
          if (!trimmedEmail) {
            setStatusMessage('Fyll i en e-postadress.')
            return
          }
          setStatusMessage('Skickar inloggningsmejl...')
          await authClient.signIn.magicLink(
            { email: trimmedEmail, callbackURL: redirectTo },
            {
              onSuccess: async () => {
                setStatusMessage(
                  isDevMagicLinkEnabled()
                    ? 'Devmode: öppnar inloggningen direkt.'
                    : 'Inloggningsmejl skickat. Kolla inkorgen.',
                )
                await maybeOpenDevMagicLink(trimmedEmail)
              },
              onError: (ctx) =>
                setErrorMessage(ctx.error.message || 'Något gick fel.'),
            },
          )
        }}
      >
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          E-post
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="relaxed-input h-12 cursor-text px-4 text-base text-slate-900 outline-none"
          />
        </label>
        <button
          type="submit"
          className="relaxed-primary-button h-12 cursor-pointer px-6 text-base font-semibold text-white"
        >
          Skicka inloggningslänk
        </button>
      </form>

      {statusMessage ? (
        <p className="text-sm text-slate-600">{statusMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-rose-600">{errorMessage}</p>
      ) : null}

      {showCreateLink ? (
        <p className="text-center text-sm text-slate-600">
          Ny förening?{' '}
          <Link
            to="/logga-in"
            search={{ redirect: '/skapa' }}
            className="cursor-pointer font-semibold text-brand hover:underline"
          >
            Logga in och skapa förening
          </Link>
        </p>
      ) : null}
    </div>
  )
}

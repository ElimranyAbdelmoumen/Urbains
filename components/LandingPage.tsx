import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🏙️ Urbains
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Signalez les problèmes</span>
            <span className="block text-indigo-600">de votre ville</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Une plateforme simple et efficace pour signaler les problèmes urbains
            et suivre leur résolution en temps réel.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/auth/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Créer un compte gratuit
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Fonctionnalités
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Comment ça fonctionne ?
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Signalez facilement
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Créez un signalement en moins de 2 minutes avec une description,
                  une localisation et une photo.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Suivez en temps réel
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Consultez l&apos;état de vos signalements et recevez des mises
                  à jour sur leur traitement.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Traitement rapide
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Les services municipaux prennent en charge vos signalements
                  rapidement et efficacement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Types de signalements
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Que pouvez-vous signaler ?
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Routes dégradées',
                  description: 'Nids de poule, fissures, chaussée endommagée',
                  icon: '🛣️',
                },
                {
                  name: 'Éclairage public',
                  description: 'Lampadaires défectueux ou manquants',
                  icon: '💡',
                },
                {
                  name: 'Signalisation',
                  description: 'Panneaux manquants ou endommagés',
                  icon: '🚦',
                },
                {
                  name: 'Déchets',
                  description: 'Dépôts sauvages, poubelles pleines',
                  icon: '🗑️',
                },
                {
                  name: 'Végétation',
                  description: 'Arbres à tailler, haies envahissantes',
                  icon: '🌳',
                },
                {
                  name: 'Autre',
                  description: 'Autres problèmes urbains',
                  icon: '📋',
                },
              ].map((category) => (
                <div
                  key={category.name}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Prêt à améliorer votre ville ?</span>
            <span className="block">Créez votre compte maintenant.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Rejoignez les citoyens qui participent activement à l&apos;amélioration
            de leur environnement urbain.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Commencer maintenant
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-gray-500"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="text-gray-400 hover:text-gray-500"
            >
              Inscription
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} Plateforme de Signalement Urbain.
              Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


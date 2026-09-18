class PMBBaseException(Exception):
    """Exception de base pour le connecteur PMB."""
    pass


class PMBConnectionError(PMBBaseException):
    """Levée lorsqu'impossible de joindre l'API PMB (Problème réseau / URL)."""
    pass


class PMBResponseError(PMBBaseException):
    """Levée lorsque PMB renvoie une erreur JSON-RPC."""
    pass


class PMBAuthenticationError(PMBBaseException):
    """Levée en cas d'échec d'authentification."""
    pass
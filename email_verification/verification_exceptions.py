class VerificationCodeRateLimitException(Exception):
    """Exception raised when there's too many verification codes generated/verified for that email"""
    pass

class VerificationCodeGenerationFailureException(Exception):
    """Exception raised when verification code couldn't be generated for that email"""
    pass
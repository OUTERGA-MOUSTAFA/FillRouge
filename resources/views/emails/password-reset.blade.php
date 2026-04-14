<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation mot de passe - Darna</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a202c;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background: linear-gradient(135deg, #f57d19 0%, #e06b0f 100%); padding: 32px 24px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: white; }
        .content { padding: 32px 24px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f57d19 0%, #e06b0f 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { text-align: center; padding: 24px; background: #f7fafc; font-size: 12px; color: #718096; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">🔐 Darna</div>
            </div>
            <div class="content">
                <h2>Réinitialisation de votre mot de passe</h2>
                <p>Bonjour {{ $user->full_name ?? 'Cher utilisateur' }},</p>
                <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <div style="text-align: center;">
                    <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/reset-password?token={{ $token }}" class="button">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                <p style="margin-top: 24px;">Ce lien expire dans <strong>1 heure</strong>.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} Darna. Tous droits réservés.</p>
            </div>
        </div>
    </div>
</body>
</html>
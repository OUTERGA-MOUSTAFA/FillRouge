<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification email - Darna</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f57d19 0%, #e06b0f 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .code {
            background-color: #f0f0f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .code span {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #f57d19;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #f57d19 0%, #e06b0f 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f9f9f9;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>🏠 Darna</h1>
                <p style="color: #fff; margin-top: 10px;">Votre plateforme de confiance</p>
            </div>
            
            <div class="content">
                <h2 style="margin-top: 0;">Bienvenue sur Darna !</h2>
                <p>Bonjour <strong>{{ $user->full_name ?? 'Cher utilisateur' }}</strong>,</p>
                <p>Merci de vous être inscrit sur Darna, la plateforme n°1 pour trouver un colocataire au Maroc.</p>
                <p>Pour activer votre compte et commencer votre recherche, veuillez utiliser le code de vérification ci-dessous :</p>
                
                <div class="code">
                    <span>{{ $code }}</span>
                </div>
                
                <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
                <p>Si vous n'avez pas créé de compte sur Darna, ignorez simplement cet email.</p>
                
                <hr style="margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666;">
                    Besoin d'aide ? Contactez notre support : <a href="mailto:support@darna.com">support@darna.com</a>
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2024 Darna. Tous droits réservés.</p>
                <p>
                    <a href="#" style="color: #666;">Conditions d'utilisation</a> | 
                    <a href="#" style="color: #666;">Politique de confidentialité</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
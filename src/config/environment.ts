function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `La variable de entorno "${name}" es obligatoria. ` +
            'Copiá .env.example a .env y completá los valores.'
        );
    }
    return value;
}

export const environment = {
    baseUrl: requireEnv('BASE_URL'),
    mediaUrl: requireEnv('MEDIA_URL'),
    user: requireEnv('DEX_USER'),
    password: requireEnv('DEX_PASSWORD'),
};

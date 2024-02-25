type Guild = {
  features: string[];
  icon: string;
  id: string;
  name: string;
  owner: boolean;
  permissions: number;
  permissions_new: string;
};

/**
 * accessTokenを使って、指定したguildに参加しているかどうかを確認する
 */
export const isJoiningGuild = async (accessToken: string, guildId: string): Promise<boolean> => {
  const res: Response = await fetch(`https://discordapp.com/api/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const guilds: Guild[] = await res.json();
    return guilds.some((guild: Guild) => guild.id === guildId);
  }
  return false;
};

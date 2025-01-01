const { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fdb = require("croxydb");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("basvuru")
    .setDescription("Sunucu Ön Kayıt sistemini ayarlar!")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addChannelOption(x => x.setName("basvuru_kanal").setDescription("Başvuru kanalı neresi?").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addChannelOption(x => x.setName("basvuru_log").setDescription("Başvuru log kanalı neresi?").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addRoleOption(x => x.setName("yetkili_rol").setDescription("Başvurusu kabul edilenlere hangi rol verilecek?").setRequired(true)),
  run: async (client, interaction) => {
    
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return await interaction.reply({
        content: `Bu komutu kullanmak için yetkiniz yetmiyor!`
      });
    }

    const basvuru_kanal = interaction.options.getChannel('basvuru_kanal');
    const basvuru_log = interaction.options.getChannel('basvuru_log');
    const yetkili_rol = interaction.options.getRole('yetkili_rol');

    if (yetkili_rol.bot) {
      return await interaction.reply({
        content: `Yetkili rolü bir bot rolü olamaz!`
      });
    }

    fdb.set(`basvuru_sistem.server_${interaction.guild.id}`, {
      basvuru_kanal: basvuru_kanal.id,
      basvuru_log: basvuru_log.id,
      yetkili_rol: yetkili_rol.id,
    })

    const channel = client.channels.cache.get(basvuru_kanal.id)

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`basvuru-${interaction.guild.id}`)
          .setLabel(`Başvur`)
          .setEmoji(`📧`)
          .setStyle(ButtonStyle.Primary)
      )
    const basvuruEmbed = new EmbedBuilder()
      .setTitle(`${interaction.guild.name} Sunucu Ön Kayıt İşlemi`)
      .setDescription(`🔷Sunucumuza Kayıt Olmak istiyorsan alttaki **Başvur** butonuna tıklayıp başvurabilirsin.`)
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
    channel.send({
      embeds: [basvuruEmbed],
      components: [row]
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
      .addFields({ name: `Başarılı!`, value: `**${interaction.guild.name}** Sunucusu için başvuru sistemi başarıyla ayarlandı! Aşağıda tüm bilgileri görebilirsiniz.` })
      .addFields({
        name: `Bilgiler`, value: `
\`Başvuru Kanalı: #${basvuru_kanal.name}\`
\`Başvuru Log: #${basvuru_log.name}\`
\`Yetkili Rol: @${yetkili_rol.name}\``
      })
      .setFooter({ text: `Önceden başvuru sistemi açtıysanız başvuru açanların datası sıfırlandı!` })
    await interaction.reply({
      embeds: [embed]
    })
  }
};

interface ContactNotificationData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentData?: string; // Base64 encoded file data
  timestamp: string;
}

function getContentType(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop();
  const mimeTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
  };
  return mimeTypes[extension || ""] || "application/octet-stream";
}

export async function sendContactNotificationEmail(
  data: ContactNotificationData
) {
  console.log("🔍 [EMAIL] Iniciando envio de email de contacto...");

  // Verificar se as credenciais do Mailjet estão configuradas
  const mjApiKeyPublic = process.env.MJ_APIKEY_PUBLIC;
  const mjApiKeyPrivate = process.env.MJ_APIKEY_PRIVATE;

  console.log("🔍 [EMAIL] Credenciais Mailjet:", {
    hasPublic: !!mjApiKeyPublic,
    hasPrivate: !!mjApiKeyPrivate,
    publicKey: mjApiKeyPublic
      ? `${mjApiKeyPublic.substring(0, 8)}...`
      : "não encontrada",
  });

  if (!mjApiKeyPublic || !mjApiKeyPrivate) {
    console.warn(
      "❌ [EMAIL] Credenciais Mailjet não configuradas, pulando envio de email"
    );
    return;
  }

  // Importar Mailjet dinamicamente
  const Mailjet = require("node-mailjet");
  const mailjet = Mailjet.apiConnect(mjApiKeyPublic, mjApiKeyPrivate);

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
        Nova Mensagem de Contacto - Reflectio
      </h2>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>ID:</strong> ${data.id}</p>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${
    data.email
  }</a></p>
        <p><strong>Telefone:</strong> ${data.phone || "Não fornecido"}</p>
        <p><strong>Data:</strong> ${new Date(data.timestamp).toLocaleString(
          "pt-PT"
        )}</p>
        ${
          data.attachmentName
            ? `<p><strong>Anexo:</strong> ${data.attachmentName} (${Math.round(
                (data.attachmentSize || 0) / 1024
              )} KB)</p>`
            : ""
        }
      </div>
      
      <h3 style="color: #374151;">Mensagem:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #6366f1;">
        ${data.message.replace(/\n/g, "<br>")}
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; text-align: center;">
        Esta mensagem foi enviada através do formulário de contacto do Reflectio.<br>
        <a href="https://reflectio.app" style="color: #6366f1;">https://reflectio.app</a>
      </p>
    </div>
  `;

  const emailText = `
Nova Mensagem de Contacto - Reflectio

ID: ${data.id}
Nome: ${data.name}
Email: ${data.email}
Telefone: ${data.phone || "Não fornecido"}
Data: ${new Date(data.timestamp).toLocaleString("pt-PT")}
${
  data.attachmentName
    ? `Anexo: ${data.attachmentName} (${Math.round(
        (data.attachmentSize || 0) / 1024
      )} KB)`
    : ""
}

Mensagem:
${data.message}

---
Esta mensagem foi enviada através do formulário de contacto do Reflectio.
https://reflectio.app
  `;

  try {
    // Preparar mensagem base
    const message: any = {
      From: {
        Email: "dinismiguelcosta@hotmail.com",
        Name: "Reflectio - Formulário de Contacto",
      },
      To: [
        {
          Email: "dinismiguelcosta@hotmail.com",
          Name: "Dinis Costa",
        },
      ],
      ReplyTo: {
        Email: data.email,
        Name: data.name,
      },
      Subject: `[Reflectio] Nova mensagem de contacto - ${data.name}`,
      TextPart: emailText,
      HTMLPart: emailHTML,
    };

    // Adicionar anexo se existir
    if (data.attachmentData && data.attachmentName) {
      const contentType = getContentType(data.attachmentName);
      message.Attachments = [
        {
          ContentType: contentType,
          Filename: data.attachmentName,
          Base64Content: data.attachmentData,
        },
      ];
      console.log("📎 [EMAIL] Anexo adicionado:", {
        filename: data.attachmentName,
        contentType,
        originalSize: `${Math.round((data.attachmentSize || 0) / 1024)}KB`,
        base64Size: `${Math.round(data.attachmentData.length / 1024)}KB`,
        base64Length: data.attachmentData.length,
      });
    } else {
      console.log("📎 [EMAIL] Nenhum anexo para adicionar");
    }

    console.log(
      "📤 [EMAIL] Estrutura da mensagem:",
      JSON.stringify(
        {
          hasAttachments: !!message.Attachments,
          attachmentCount: message.Attachments?.length || 0,
          messageKeys: Object.keys(message),
        },
        null,
        2
      )
    );

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [message],
    });

    console.log("📤 [EMAIL] Enviando email via Mailjet...");
    const result = await request;
    console.log(
      "✅ [EMAIL] Email enviado com sucesso via Mailjet:",
      result.body
    );
    return result.body;
  } catch (error) {
    console.error("❌ [EMAIL] Erro ao enviar email via Mailjet:", error);
    throw new Error(`Erro ao enviar email via Mailjet: ${error}`);
  }
}

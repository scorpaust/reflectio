import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendContactNotificationEmail } from "@/lib/email/contact-notification";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const attachment = formData.get("attachment") as File | null;

    // Validação básica
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nome, email e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validar tamanho do anexo (máx 500KB - limite conservador para garantir entrega)
    if (attachment && attachment.size > 500 * 1024) {
      return NextResponse.json(
        {
          error:
            "Anexo muito grande. Máximo 500KB para garantir entrega por email.",
        },
        { status: 400 }
      );
    }

    // Usar cliente anónimo para formulário de contacto público
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Salvar no banco de dados
    const contactData = {
      name,
      email,
      phone: phone || null,
      message,
      attachment_name: attachment?.name || null,
      attachment_size: attachment?.size || null,
      status: "new",
    };

    console.log("📧 Tentando salvar mensagem de contacto:", contactData);

    const { data, error } = await supabase
      .from("contact_messages")
      .insert([contactData])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro detalhado ao salvar mensagem de contacto:", {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          error: "Erro ao salvar mensagem de contacto",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    // Log da mensagem salva
    console.log("📧 Nova mensagem de contacto salva:", {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message:
        data.message.substring(0, 200) +
        (data.message.length > 200 ? "..." : ""),
      hasAttachment: !!attachment,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
      timestamp: data.created_at,
    });

    // Enviar email de notificação
    try {
      // Converter anexo para base64 se existir
      let attachmentData: string | undefined;
      if (attachment) {
        const buffer = Buffer.from(await attachment.arrayBuffer());
        attachmentData = buffer.toString("base64");
        console.log("📎 Anexo convertido para base64:", {
          name: attachment.name,
          size: attachment.size,
          base64Length: attachmentData.length,
        });
      }

      await sendContactNotificationEmail({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        attachmentName: attachment?.name,
        attachmentSize: attachment?.size,
        attachmentData,
        timestamp: data.created_at,
      });
    } catch (emailError) {
      console.error("Erro ao enviar email de notificação:", emailError);
      // Não falhar a API se o email falhar
    }

    return NextResponse.json({
      success: true,
      message: "Mensagem enviada com sucesso",
      id: data.id,
    });
  } catch (error) {
    console.error("Erro no endpoint de contacto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

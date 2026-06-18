import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
} from "@react-email/components";
import React from "react";

export interface PasswordResetProps {
  code: string;
}

export function PasswordReset({ code = "847291" }: PasswordResetProps) {
  return (
    <Html lang="pt-BR">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={main}>
        <Container style={container}>

          {/* ── HEADER ── */}
          <Section style={header}>
            {/* Decorative top stripe */}
            <div style={topStripe} />

            {/* Logo area */}
            <div style={logoWrap}>
              {/* Coffee bean SVG icon */}
              <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block", margin: "0 auto 12px" }}
              >
                <circle cx="22" cy="22" r="22" fill="#F97316" />
                <ellipse
                  cx="22"
                  cy="22"
                  rx="11"
                  ry="14"
                  fill="#1a0a00"
                  transform="rotate(-15 22 22)"
                />
                <path
                  d="M22 10 Q26 22 22 34"
                  stroke="#F97316"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <Heading as="h1" style={headerTitle}>
                Back Amber
              </Heading>
              <Text style={headerSubtitle}>C O F F E E</Text>
            </div>

            {/* Decorative divider */}
            <div style={headerDivider}>
              <span style={headerDividerLine} />
              <span style={headerDividerDot} />
              <span style={headerDividerLine} />
            </div>
          </Section>

          {/* ── CONTENT ── */}
          <Section style={content}>
            <Text style={eyebrow}>SEGURANÇA DA CONTA</Text>

            <Heading as="h2" style={title}>
              Redefinição de Senha
            </Heading>

            <Text style={text}>
              Recebemos uma solicitação para redefinir a senha da sua conta.
              Use o código abaixo para prosseguir com a redefinição:
            </Text>

            {/* Code box */}
            <Section style={codeBox}>
              <Text style={codeLabel}>SEU CÓDIGO DE VERIFICAÇÃO</Text>
              <Text style={codeText}>{code}</Text>
              <Text style={codeExpiry}>⏱ Expira em 5 minutos</Text>
            </Section>

            <Text style={text}>
              Após inserir o código, você será direcionado para criar uma nova
              senha. Escolha uma senha forte para manter sua conta protegida.
            </Text>

            {/* Alert box */}
            <Section style={alertBox}>
              <Text style={alertText}>
                🔒{" "}
                <strong>Não solicitou a redefinição?</strong> Ignore este
                e-mail — sua conta continua segura e nenhuma alteração foi
                realizada.
              </Text>
            </Section>

            <Text style={signature}>— Equipe Back Amber Coffee</Text>
          </Section>

          {/* ── DIVIDER ── */}
          <Hr style={hr} />

          {/* ── FOOTER ── */}
          <Section style={footer}>
            {/* Decorative coffee rings */}
            <div style={footerDecor}>
              <span style={ring1} />
              <span style={ring2} />
            </div>

            <Text style={footerTagline}>
              "Cada sorvo, uma experiência única."
            </Text>

            <Text style={footerText}>
              © {new Date().getFullYear()} Back Amber Coffee. Todos os direitos
              reservados.
            </Text>
            <Text style={footerLinks}>
              Política de Privacidade &nbsp;·&nbsp; Termos de Uso &nbsp;·&nbsp;
              Suporte
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */

const AMBER = "#F97316";
const AMBER_DARK = "#EA6A00";
const AMBER_LIGHT = "#FFF4EC";
const BLACK = "#0D0D0D";
const DARK = "#1A1A1A";
const GRAY = "#4A4A4A";
const LIGHT_GRAY = "#A3A3A3";
const OFF_WHITE = "#FAF7F4";
const BORDER = "#E8DDD4";

const main: React.CSSProperties = {
  backgroundColor: OFF_WHITE,
  fontFamily: "'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  padding: "40px 16px",
};

const container: React.CSSProperties = {
  maxWidth: "580px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
  border: `1px solid ${BORDER}`,
};

/* Header */
const header: React.CSSProperties = {
  backgroundColor: BLACK,
  padding: "0 0 36px",
  textAlign: "center" as const,
  position: "relative" as const,
};

const topStripe: React.CSSProperties = {
  backgroundColor: AMBER,
  height: "5px",
  width: "100%",
  display: "block",
  marginBottom: "36px",
};

const logoWrap: React.CSSProperties = {
  padding: "0 40px 20px",
};

const headerTitle: React.CSSProperties = {
  margin: "0 0 4px",
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: 900,
  fontFamily: "'Playfair Display', Georgia, serif",
  letterSpacing: "1px",
  lineHeight: "1.1",
};

const headerSubtitle: React.CSSProperties = {
  margin: "0",
  color: AMBER,
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "8px",
  fontFamily: "'Lato', sans-serif",
};

const headerDivider: React.CSSProperties = {
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  gap: "10px",
  padding: "0 60px",
};

const headerDividerLine: React.CSSProperties = {
  display: "inline-block",
  flex: "1",
  height: "1px",
  backgroundColor: "#EA6A00",
};

const headerDividerDot: React.CSSProperties = {
  display: "inline-block",
  width: "5px",
  height: "5px",
  borderRadius: "50%",
  backgroundColor: AMBER,
};

/* Content */
const content: React.CSSProperties = {
  padding: "44px 48px 36px",
};

const eyebrow: React.CSSProperties = {
  margin: "0 0 12px",
  color: AMBER_DARK,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "3px",
  fontFamily: "'Lato', sans-serif",
};

const title: React.CSSProperties = {
  margin: "0 0 20px",
  color: BLACK,
  fontSize: "26px",
  fontWeight: 700,
  fontFamily: "'Playfair Display', Georgia, serif",
  lineHeight: "1.25",
};

const text: React.CSSProperties = {
  margin: "0 0 20px",
  color: GRAY,
  fontSize: "15px",
  lineHeight: "1.7",
  fontWeight: 400,
};

/* Code Box */
const codeBox: React.CSSProperties = {
  backgroundColor: BLACK,
  borderRadius: "6px",
  padding: "28px 32px 24px",
  textAlign: "center" as const,
  margin: "0 0 28px",
  position: "relative" as const,
};

const codeLabel: React.CSSProperties = {
  margin: "0 0 12px",
  color: "rgba(249,115,22,0.8)",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "3px",
  fontFamily: "'Lato', sans-serif",
};

const codeText: React.CSSProperties = {
  fontSize: "44px",
  fontWeight: 900,
  letterSpacing: "10px",
  color: AMBER,
  fontFamily: "'Playfair Display', 'Courier New', monospace",
  margin: "0 0 12px",
  lineHeight: "1",
};

const codeExpiry: React.CSSProperties = {
  margin: "0",
  color: LIGHT_GRAY,
  fontSize: "12px",
  fontWeight: 300,
  letterSpacing: "0.5px",
};

/* Alert */
const alertBox: React.CSSProperties = {
  backgroundColor: AMBER_LIGHT,
  borderLeft: `3px solid ${AMBER}`,
  borderRadius: "0 4px 4px 0",
  padding: "14px 18px",
  margin: "0 0 28px",
};

const alertText: React.CSSProperties = {
  margin: "0",
  color: DARK,
  fontSize: "13px",
  lineHeight: "1.6",
};

const signature: React.CSSProperties = {
  margin: "0",
  color: LIGHT_GRAY,
  fontSize: "13px",
  fontStyle: "italic" as const,
};

/* HR */
const hr: React.CSSProperties = {
  borderColor: BORDER,
  margin: "0",
};

/* Footer */
const footer: React.CSSProperties = {
  backgroundColor: DARK,
  padding: "28px 48px 32px",
  textAlign: "center" as const,
  position: "relative" as const,
  overflow: "hidden" as const,
};

const footerDecor: React.CSSProperties = {
  position: "relative" as const,
  height: "0",
};

const ring1: React.CSSProperties = {
  position: "absolute" as const,
  right: "-20px",
  top: "-40px",
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  border: "1px solid rgba(249,115,22,0.12)",
  display: "block",
};

const ring2: React.CSSProperties = {
  position: "absolute" as const,
  right: "10px",
  top: "-20px",
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  border: "1px solid rgba(249,115,22,0.08)",
  display: "block",
};

const footerTagline: React.CSSProperties = {
  margin: "0 0 16px",
  color: "rgba(249,115,22,0.7)",
  fontSize: "13px",
  fontStyle: "italic" as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  letterSpacing: "0.5px",
};

const footerText: React.CSSProperties = {
  margin: "0 0 8px",
  color: "rgba(255,255,255,0.35)",
  fontSize: "12px",
  letterSpacing: "0.3px",
};

const footerLinks: React.CSSProperties = {
  margin: "0",
  color: "rgba(249,115,22,0.5)",
  fontSize: "11px",
  letterSpacing: "0.5px",
};

export default PasswordReset;
export class AttendanceStatus {
  static readonly PRESENTE = "presente";
  static readonly FALTA = "falta";
  static readonly FALTA_JUSTIFICADA = "falta_justificada";
  static readonly FOLGA = "folga";

  static readonly VALUES = [
    AttendanceStatus.PRESENTE,
    AttendanceStatus.FALTA,
    AttendanceStatus.FALTA_JUSTIFICADA,
    AttendanceStatus.FOLGA
  ] as const;

  static values() {
    return AttendanceStatus.VALUES;
  }

  static isValid(status: string): status is typeof AttendanceStatus.VALUES[number] {
    return AttendanceStatus.VALUES.includes(status as any);
  }
}

export type AttendanceStatusType =
  (typeof AttendanceStatus.VALUES)[number];

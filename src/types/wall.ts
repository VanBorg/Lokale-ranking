/** Eén wandsegment van de kamerpolygoon (rechte of schuine rand). */
export interface Wall {
  id: string;
  label: string;
  /** Randlengte in cm (langs de vloer). */
  width: number;
  /** Hoogte in cm. */
  height: number;
  /** Bruto wandoppervlak in m². */
  surfaceArea: number;
  /** Netto m² — gelijk aan `surfaceArea` tot er later openingen worden gemodelleerd. */
  netArea: number;
}

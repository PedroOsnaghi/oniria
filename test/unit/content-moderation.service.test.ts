import { ContentModerationService } from '../../src/application/services/content-moderation.service';

describe('ContentModerationService — extensive test suite', () => {
  let service: ContentModerationService;
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  beforeEach(() => {
    service = new ContentModerationService();
  });

  const inappropriateWords = [

    'matar', 'morir', 'muerte', 'asesinar', 'suicidio', 'golpear', 'apuñalar', 
    'disparar', 'torturar', 'masacrar', 'acuchillar', 'estrangular', 'violar',
    'mutilar', 'decapitar', 'sangre', 'bomba', 'pistola', 'cuchillo', 'arma',

    'odio', 'idiota', 'estupido', 'imbecil', 'pendejo', 'retrasado', 'subnormal',
    'mongol', 'tarado', 'gilipollas', 'capullo', 'cabrón', 'mamón', 'pelotudo',
    'boludo', 'desgraciado', 'cretino', 'baboso', 'escoria', 'basura', 'mierda',
    'joder', 'hostia', 'carajo',

    'sexo', 'porno', 'desnudo', 'desnuda', 'masturbar', 'eyacular', 'orgasmo',
    'semen', 'vagina', 'pene', 'coño', 'chocho', 'cipote', 'polla', 'verga',
    'pito', 'culo', 'tetas', 'follar', 'coger', 'chingar', 'puta', 'zorra', 'perra',

    'cocaina', 'heroina', 'droga', 'narco', 'robar', 'estafar', 'secuestrar',
    'chantajear', 'sobornar', 'terrorismo',

    'kill', 'die', 'hate', 'stupid', 'fuck', 'bitch', 'asshole', 'cunt', 'slut'
  ];

  for (const w of inappropriateWords) {
    it(`flags when the word "${w}" appears (simple include)`, () => {
      const text = `Esto contiene la palabra ${w} en una frase.`;
      const res = service.validateContentInterpretation(text);
      expect(res.isValid).toBe(false);
      expect(res.reason).toBeDefined();
    });
  }

  const patternCases = [

    { text: 'Te voy a matar mañana', expectFlag: true, desc: 'explicit threat pattern' },
    { text: 'Te voy a hacer daño', expectFlag: true, desc: 'generic threat pattern' },
    { text: 'Ojalá te mueras pronto', expectFlag: true, desc: 'wishing death pattern' },
    { text: 'espero que te pudras', expectFlag: true, desc: 'wishing rot pattern' },
    { text: 'se donde vives, ten cuidado', expectFlag: true, desc: 'doxing-like threat' },

    { text: 'Te odio con todo mi ser', expectFlag: true, desc: 'hate directed' },
    { text: 'eres un hijo de puta', expectFlag: true, desc: 'strong composite insult' },
    { text: 'me cago en tus muertos', expectFlag: true, desc: 'very strong composite insult' },
    { text: 'odio a los gays', expectFlag: true, desc: 'hate speech against group' },
    { text: 'soñe que me suicidaba', expectFlag: true, desc: 'suicide pattern' },

    { text: 'voy a m a t a r t e', expectFlag: true, desc: 'filter evasion with spaces' },
    { text: 'eres un p u t o', expectFlag: true, desc: 'filter evasion with spaces 2' },
    { text: 'te voy a m@t@r', expectFlag: true, desc: 'filter evasion with symbols (l33t)' },
    { text: 'odiooooo a todo el mundo', expectFlag: true, desc: 'filter evasion with repeated chars' },

    { text: 'Mira https://example.com para más', expectFlag: true, desc: 'URL should flag per patterns' },
    { text: 'Llamame al 123-456-7890', expectFlag: true, desc: 'phone-like pattern should flag' },
    { text: 'mi correo es test@ejemplo.org', expectFlag: true, desc: 'email pattern should flag' },

    { text: 'Soñé que volaba y era feliz', expectFlag: false, desc: 'benign dream' },
    { text: 'Siento remordimiento por lo que hice', expectFlag: false, desc: 'false positive for "morir"' },
    { text: 'Este político es notorio por su falta de carisma', expectFlag: false, desc: 'false positive for "odio"' },
    { text: 'Tuvo que matar su orgullo para disculparse', expectFlag: false, desc: 'metaphorical use of "matar"' },
    { text: 'El documental trataba el tema del suicidio con mucho respeto', expectFlag: false, desc: 'educational/descriptive context' }
  ];

  for (const c of patternCases) {
    it(`pattern case: ${c.desc} -> "${c.text}"`, () => {
      const res = service.validateContentInterpretation(c.text);
      if (c.expectFlag) {
        expect(res.isValid).toBe(false);
        expect(res.reason).toBeDefined();
      } else {
        expect(res.isValid).toBe(true);
      }
    });
  }

  it('is case-insensitive and ignores punctuation around words', () => {
    const res1 = service.validateContentInterpretation('MATAr');
    expect(res1.isValid).toBe(false);

    const res2 = service.validateContentInterpretation('Te.voy,a!matar?');
    expect(res2.isValid).toBe(false);
  });

  it('does not flag substrings like "skill" (contains "kill") due to word-boundaries', () => {
    const res = service.validateContentInterpretation('I have great skill as a painter');
    expect(res.isValid).toBe(true);
  });

  it('accepts clearly benign descriptive dreams (first two)', () => {
    const r1 = service.validateContentInterpretation('Soñé que volaba sobre las montañas');
    expect(r1.isValid).toBe(true);
  });

  it('note: educational mention of "sexo" currently will be flagged by the service', () => {
    const r = service.validateContentInterpretation('me gusta mucho el porno');
    expect(r.isValid).toBe(false);
    expect(r.reason).toBeDefined();
  });

  it('empty string -> currently accepted by implementation', () => {
    const res = service.validateContentInterpretation('');
    expect(res.isValid).toBe(true);
  });

  it('string with only spaces -> currently accepted by implementation', () => {
    const res = service.validateContentInterpretation('      ');
    expect(res.isValid).toBe(true);
  });

  it('very long text containing a bad word still flagged', () => {
    const long = 'Palabras inocuas '.repeat(500) + ' matar ' + ' más texto'.repeat(200);
    const res = service.validateContentInterpretation(long);
    expect(res.isValid).toBe(false);
  });

  it('logInappropriateContent calls console.warn and does not throw', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => service.logInappropriateContent('contenido sensible', 'razón', 'user-xyz')).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

describe('Pruebas de Camino Feliz (Enfocadas en Sueños)', () => {
  let service: ContentModerationService;
  beforeEach(() => {
    service = new ContentModerationService();
  });

  const casosValidosEnSueños = [
    { text: 'Soñé que volaba sobre un océano de nubes de algodón.', desc: 'Sueño simple y positivo' },
    { text: 'En mi sueño, caminaba por un bosque silencioso donde los árboles susurraban melodías.', desc: 'Sueño sensorial y pacífico' },
    { text: 'Tuve un sueño muy emotivo donde me reencontraba con un viejo amigo y nos dábamos un abrazo.', desc: 'Sueño emocionalmente positivo' },
    { text: 'Soñé que leía un libro con páginas en blanco, pero de alguna manera entendía la historia.', desc: 'Sueño abstracto y neutral' },

    { text: 'Soñé que estaba perdido en mi propia casa y sentía una profunda soledad.', desc: 'Sueño con emoción de soledad' },
    { text: 'Tuve una pesadilla en la que llegaba tarde a un examen importante y sentía mucha ansiedad.', desc: 'Sueño con emoción de ansiedad' },
    { text: 'En el sueño, llovía sin parar y todo se veía gris, lo que me generaba una gran melancolía.', desc: 'Sueño con emoción de melancolía' },

    { text: 'Soñé que un personaje sabio me aconsejaba que para evolucionar, debía "matar mi ego".', desc: 'Uso metafórico de "matar" en un sueño' },
    { text: 'Tuve un sueño muy raro donde estaba en una clase de historia y el profesor hablaba sobre la tasa de muerte infantil en la era victoriana.', desc: 'Contexto educativo de "muerte" en un sueño' },
    { text: 'En mi sueño, yo era un detective que investigaba un caso y sentía un gran remordimiento por una pista que se me pasó.', desc: 'Palabra "remordimiento" (contiene "morir") en un sueño' },
    { text: 'Soñé que daba un discurso apasionado sobre mi odio a la opresión y la tiranía.', desc: 'Uso de "odio" hacia un concepto abstracto en un sueño' },
    { text: 'Tuve un sueño muy cotidiano: iba a la droguería porque me dolía la cabeza.', desc: 'Palabra "droguería" (contiene "droga") en un sueño' },
    { text: 'Soñé que era un botánico y estudiaba el sexo de unas flores exóticas para clasificarlas.', desc: 'Uso científico de "sexo" en un sueño' },

    { text: 'En el sueño, veía una secuencia de números que se repetía por todas partes: 4 8 15 16 23 42.', desc: 'Contenido puramente numérico en un sueño' },
    { text: 'Mi sueño cambió de repente y un personaje me empezó a hablar en inglés, diciendo "This is all just a dream".', desc: 'Texto en otro idioma dentro de un sueño' }
  ];

  for (const caso of casosValidosEnSueños) {
    it(`debe permitir: ${caso.desc}`, () => {
      const res = service.validateContentInterpretation(caso.text);
      expect(res.isValid).toBe(true);
      expect(res.reason).toBeUndefined();
    });
  }
});
});
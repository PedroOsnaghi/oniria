import 'reflect-metadata';
import { ReinterpreteDreamRequestDto } from '../../../../src/infrastructure/dtos/dream-node';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('ReinterpreteDreamRequestDto Validation', () => {
  it('should validate successfully with valid data', async () => {
    const plainObject = {
      description: 'Soñé que volaba sobre una ciudad desconocida',
      previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
    };

    const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation for missing description', async () => {
    const dto = plainToClass(ReinterpreteDreamRequestDto, {
      previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
    });

    const errors = await validate(dto);
    expect(errors[0]?.property).toBe('description');
    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for missing previousInterpretation', async () => {
    const dto = plainToClass(ReinterpreteDreamRequestDto, {
      description: 'Soñé que volaba sobre una ciudad desconocida'
    });

    const errors = await validate(dto);
    expect(errors[0]?.property).toBe('previousInterpretation');
    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for description too short', async () => {
    const dto = plainToClass(ReinterpreteDreamRequestDto, {
      description: 'abc',
      previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
    });

    const errors = await validate(dto);
    expect(errors[0]?.property).toBe('description');
    expect(errors[0]?.constraints).toHaveProperty('minLength');
  });

  it('should fail validation for previousInterpretation too short', async () => {
    const dto = plainToClass(ReinterpreteDreamRequestDto, {
      description: 'Soñé que volaba sobre una ciudad desconocida',
      previousInterpretation: 'ab'
    });

    const errors = await validate(dto);
    expect(errors[0]?.property).toBe('previousInterpretation');
    expect(errors[0]?.constraints).toHaveProperty('minLength');
  });

  it('should pass validation for long descriptions', async () => {
    const dto = plainToClass(ReinterpreteDreamRequestDto, {
      description: 'Este es un sueño muy largo con muchos detalles sobre una experiencia onírica compleja...',
      previousInterpretation: 'Interpretación larga y válida para cumplir con los requisitos...'
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

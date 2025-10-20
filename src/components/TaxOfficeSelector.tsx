import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getVoivodeships, getTaxOfficesByVoivodeship } from '../constants/taxOffices';

interface TaxOfficeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TaxOfficeSelector({
  value,
  onChange,
  label = 'Urząd Skarbowy',
  required = false,
  disabled = false,
}: TaxOfficeSelectorProps) {
  const voivodeships = getVoivodeships();

  return (
    <div className="space-y-2">
      <Label htmlFor="taxOffice">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="taxOffice">
          <SelectValue placeholder="Wybierz urząd skarbowy" />
        </SelectTrigger>
        <SelectContent>
          {voivodeships.map((voivodeship) => {
            const offices = getTaxOfficesByVoivodeship(voivodeship);
            return (
              <SelectGroup key={voivodeship}>
                <SelectLabel className="capitalize">{voivodeship}</SelectLabel>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

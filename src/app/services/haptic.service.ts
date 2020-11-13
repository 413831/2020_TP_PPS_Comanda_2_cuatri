import { Injectable } from '@angular/core';
import
{
  Plugins,
  HapticsImpactStyle
} from '@capacitor/core';

const { Haptics } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class HapticService
{

  constructor() { }

  static vibrar()
  {
    Haptics.vibrate();
  }
}

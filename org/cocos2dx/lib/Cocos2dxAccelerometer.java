package org.cocos2dx.lib;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

public class Cocos2dxAccelerometer
  implements SensorEventListener
{
  private static final String TAG = "Cocos2dxAccelerometer";
  private Sensor mAccelerometer;
  private Context mContext;
  private SensorManager mSensorManager;

  public Cocos2dxAccelerometer(Context paramContext)
  {
    this.mContext = paramContext;
    this.mSensorManager = ((SensorManager)this.mContext.getSystemService("sensor"));
    this.mAccelerometer = this.mSensorManager.getDefaultSensor(1);
  }

  private static native void onSensorChanged(float paramFloat1, float paramFloat2, float paramFloat3, long paramLong);

  public void disable()
  {
    this.mSensorManager.unregisterListener(this);
  }

  public void enable()
  {
    this.mSensorManager.registerListener(this, this.mAccelerometer, 1);
  }

  public void onAccuracyChanged(Sensor paramSensor, int paramInt)
  {
  }

  public void onSensorChanged(SensorEvent paramSensorEvent)
  {
    if (paramSensorEvent.sensor.getType() != 1)
      return;
    onSensorChanged(paramSensorEvent.values[0], paramSensorEvent.values[1], paramSensorEvent.values[2], paramSensorEvent.timestamp);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxAccelerometer
 * JD-Core Version:    0.6.2
 */
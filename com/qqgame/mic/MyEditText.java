package com.qqgame.mic;

import android.content.Context;
import android.widget.EditText;

public class MyEditText extends EditText
{
  public static final int EDIT_STYLE_AUTOSCROLL = 2;
  public static final int EDIT_STYLE_MULTIlINE = 1;
  public static final int EDIT_STYLE_PASSWORD = 8;
  public static final int EDIT_STYLE_READONLY = 16;
  public static final int EDIT_STYLE_TABSTOP = 4;
  public MyEditTextProperty editproperty = null;

  public MyEditText(Context paramContext)
  {
    super(paramContext);
    try
    {
      this.editproperty = new MyEditTextProperty();
      return;
    }
    catch (Exception localException)
    {
      localException.printStackTrace();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MyEditText
 * JD-Core Version:    0.6.2
 */
package com.qqgame.mic;

import android.os.Handler;
import android.os.Message;
import android.text.Editable;
import android.text.InputFilter;
import android.text.InputFilter.LengthFilter;
import android.text.TextWatcher;
import android.util.Log;
import android.widget.RelativeLayout;
import android.widget.RelativeLayout.LayoutParams;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

public class MyEditTextMgr
{
  private static final int HANDLER_ADJUST_EDIT = 11;
  private static final int HANDLER_CREATE_EDIT = 10;
  public static final int HANDLER_EDIT_BEGIN = 10;
  public static final int HANDLER_EDIT_END = 20;
  private static final int HANDLER_ENABLE_EDIT = 15;
  private static final int HANDLER_HIDE_EDIT = 12;
  private static final int HANDLER_LIMITTEXT_EDIT = 20;
  private static final int HANDLER_NUMBERONLY_EDIT = 18;
  private static final int HANDLER_RELEASE_EDIT = 16;
  private static final int HANDLER_SETBORDERNULL_EDIT = 19;
  private static final int HANDLER_SETTEXTCOLOR_EDIT = 17;
  private static final int HANDLER_SETTEXT_EDIT = 14;
  private static final int HANDLER_SHOW_EDIT = 13;
  private static int s_EDIT_ID = 0;
  private static HashMap<Integer, MyEditText> s_mEditMap = null;
  private static HashMap<Integer, String> s_mEditStr = null;

  public MyEditTextMgr()
  {
    if (s_mEditMap == null)
      s_mEditMap = new HashMap();
    if (s_mEditStr == null)
      s_mEditStr = new HashMap();
  }

  private void AdjustEdit(int paramInt, int[] paramArrayOfInt)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
    if (localMyEditText != null)
    {
      RelativeLayout.LayoutParams localLayoutParams = new RelativeLayout.LayoutParams(-2, -2);
      localLayoutParams.addRule(9);
      localLayoutParams.addRule(10);
      localLayoutParams.leftMargin = paramArrayOfInt[0];
      localLayoutParams.topMargin = paramArrayOfInt[1];
      localLayoutParams.width = paramArrayOfInt[2];
      localLayoutParams.height = paramArrayOfInt[3];
      localMyEditText.setLayoutParams(localLayoutParams);
      localMyEditText.editproperty.rect = paramArrayOfInt;
      Log.i("MyEditTextMgr", "CNativeEdit>>AdjustEdit(" + paramInt + ") rect(" + paramArrayOfInt[0] + ", " + paramArrayOfInt[1] + ", " + paramArrayOfInt[2] + ", " + paramArrayOfInt[3] + "), TextSize:" + localMyEditText.getTextSize());
    }
  }

  public static void AdjustLayout(int paramInt1, int paramInt2, int paramInt3, int paramInt4, int paramInt5)
  {
    if (paramInt1 > 0)
    {
      int[] arrayOfInt = { paramInt2, paramInt3, paramInt4, paramInt5 };
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 11;
      localMessage.arg1 = paramInt1;
      localMessage.obj = arrayOfInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  private void CreateEdit(int paramInt, int[] paramArrayOfInt)
  {
    final MyEditText localMyEditText1 = new MyEditText(MicActivity.s_CurrActivity);
    Log.i("MyEditTextMgr", "fisher>>nID:" + paramInt + ", args[0]:" + paramArrayOfInt[0] + ", args[1]:" + paramArrayOfInt[1]);
    if (localMyEditText1 != null)
    {
      localMyEditText1.setBackgroundDrawable(null);
      localMyEditText1.setIncludeFontPadding(false);
      localMyEditText1.setVisibility(0);
      localMyEditText1.setId(paramArrayOfInt[1]);
      Log.i("CreateEdit", "fisher>>@2_nEditAddr:" + paramArrayOfInt[1] + ", et.getId:" + localMyEditText1.getId());
      if ((0x1 & paramArrayOfInt[0]) <= 0)
        break label247;
      localMyEditText1.setSingleLine(false);
      if ((0x8 & paramArrayOfInt[0]) <= 0)
        break label255;
      localMyEditText1.setInputType(129);
    }
    while (true)
    {
      localMyEditText1.setImeOptions(6);
      localMyEditText1.editproperty.nID = paramInt;
      localMyEditText1.editproperty.nStyle = paramArrayOfInt[0];
      localMyEditText1.editproperty.nEditAddr = paramArrayOfInt[1];
      MyEditText localMyEditText2 = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
      if (localMyEditText2 != null)
        MicActivity.s_layout.removeView(localMyEditText2);
      MicActivity.s_layout.addView(localMyEditText1);
      s_mEditMap.put(Integer.valueOf(paramInt), localMyEditText1);
      localMyEditText1.addTextChangedListener(new TextWatcher()
      {
        public void afterTextChanged(Editable paramAnonymousEditable)
        {
        }

        public void beforeTextChanged(CharSequence paramAnonymousCharSequence, int paramAnonymousInt1, int paramAnonymousInt2, int paramAnonymousInt3)
        {
        }

        public void onTextChanged(CharSequence paramAnonymousCharSequence, int paramAnonymousInt1, int paramAnonymousInt2, int paramAnonymousInt3)
        {
          if ((paramAnonymousInt2 > 0) || (paramAnonymousInt3 > 0));
          try
          {
            Log.i("MyEditTextMgr", "fisher>>onTextChanged nEditAddr:" + localMyEditText1.getId() + ", before:" + paramAnonymousInt2 + ", count:" + paramAnonymousInt3);
            boolean bool = localMyEditText1.getText().toString().equals(localMyEditText1.editproperty.strText);
            MyEditTextMgr.this.onEditorTextChangedJNI(localMyEditText1.getId(), bool);
            if (!bool)
            {
              localMyEditText1.editproperty.strText = localMyEditText1.getText().toString();
              MyEditTextMgr.s_mEditStr.remove(Integer.valueOf(localMyEditText1.editproperty.nID));
              MyEditTextMgr.s_mEditStr.put(Integer.valueOf(localMyEditText1.editproperty.nID), localMyEditText1.editproperty.strText);
            }
            return;
          }
          catch (Exception localException)
          {
            localException.printStackTrace();
          }
        }
      });
      return;
      label247: localMyEditText1.setSingleLine(true);
      break;
      label255: if ((0x1 & paramArrayOfInt[0]) > 0)
        localMyEditText1.setInputType(131073);
      else
        localMyEditText1.setInputType(1);
    }
  }

  public static int CreateEditText(int paramInt1, int paramInt2, int paramInt3)
  {
    if ((MicActivity.s_CurrActivity != null) && (MicActivity.s_layout != null))
    {
      if (paramInt3 == 0)
      {
        paramInt3 = 1 + s_EDIT_ID;
        s_EDIT_ID = paramInt3;
      }
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 10;
      localMessage.arg1 = paramInt3;
      int[] arrayOfInt = { paramInt1, paramInt2 };
      localMessage.obj = arrayOfInt;
      MicActivity.s_handler.sendMessage(localMessage);
      Log.i("MyEditTextMgr", "fisher>>@1_nEditAddr:" + paramInt2 + ", args[1]:" + arrayOfInt[1]);
    }
    return paramInt3;
  }

  public static String GetEditText(int paramInt)
  {
    if (paramInt > 0)
    {
      Log.i("MyEditTextMgr", "CNativeEdit>>GetEditText(" + paramInt + ") rtString:" + (String)s_mEditStr.get(Integer.valueOf(paramInt)));
      return (String)s_mEditStr.get(Integer.valueOf(paramInt));
    }
    Log.i("MyEditTextMgr", "CNativeEdit>>GetEditText(" + paramInt + ") Edit is null");
    return "";
  }

  private void HideEdit(int paramInt)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
    if (localMyEditText != null)
      localMyEditText.setVisibility(4);
  }

  public static void HideEditText(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 12;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  private void ReleaseEdit(int paramInt)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
    if (localMyEditText != null)
    {
      localMyEditText.editproperty.nID = 0;
      MicActivity.s_layout.removeView(localMyEditText);
      s_mEditMap.remove(Integer.valueOf(paramInt));
    }
  }

  public static void ReleaseEditText(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 16;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  private void SetBorderStyleNull(int paramInt)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
    if (localMyEditText != null)
    {
      localMyEditText.setPadding(0, 0, 0, 0);
      localMyEditText.editproperty.bNoneBorder = true;
    }
  }

  private void SetEditEnable(int paramInt1, int paramInt2)
  {
    boolean bool1 = true;
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt1));
    boolean bool2;
    MyEditTextProperty localMyEditTextProperty;
    if (localMyEditText != null)
    {
      if (paramInt2 <= 0)
        break label54;
      bool2 = bool1;
      localMyEditText.setEnabled(bool2);
      localMyEditTextProperty = localMyEditText.editproperty;
      if (paramInt2 <= 0)
        break label60;
    }
    while (true)
    {
      localMyEditTextProperty.bEnable = bool1;
      return;
      label54: bool2 = false;
      break;
      label60: bool1 = false;
    }
  }

  public static void SetEditText(int paramInt, String paramString)
  {
    if (paramInt > 0)
    {
      Log.i("MyEditTextMgr", "CNativeEdit>>Msg SetEditText(" + paramInt + ") string:" + paramString);
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 14;
      localMessage.arg1 = paramInt;
      localMessage.obj = paramString;
      s_mEditStr.put(Integer.valueOf(paramInt), paramString);
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  public static void SetEditTextBorderNull(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 19;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  public static void SetEditTextColor(int paramInt1, int paramInt2)
  {
    if (paramInt1 > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 17;
      localMessage.arg1 = paramInt1;
      localMessage.arg2 = paramInt2;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  public static void SetEditTextEnable(int paramInt, boolean paramBoolean)
  {
    Message localMessage;
    if (paramInt > 0)
    {
      localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 15;
      localMessage.arg1 = paramInt;
      if (!paramBoolean)
        break label42;
    }
    label42: for (int i = 1; ; i = 0)
    {
      localMessage.arg2 = i;
      MicActivity.s_handler.sendMessage(localMessage);
      return;
    }
  }

  public static void SetEditTextLimitText(int paramInt1, int paramInt2)
  {
    if (paramInt1 > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 20;
      localMessage.arg1 = paramInt1;
      localMessage.arg2 = paramInt2;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  public static void SetEditTextNumberOnly(int paramInt, boolean paramBoolean)
  {
    Message localMessage;
    if (paramInt > 0)
    {
      localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 18;
      localMessage.arg1 = paramInt;
      if (!paramBoolean)
        break label42;
    }
    label42: for (int i = 1; ; i = 0)
    {
      localMessage.arg2 = i;
      MicActivity.s_handler.sendMessage(localMessage);
      return;
    }
  }

  private void SetLimitText(int paramInt1, int paramInt2)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt1));
    if (localMyEditText != null)
    {
      localMyEditText.editproperty.nMax = paramInt2;
      InputFilter[] arrayOfInputFilter = new InputFilter[1];
      arrayOfInputFilter[0] = new InputFilter.LengthFilter(paramInt2);
      localMyEditText.setFilters(arrayOfInputFilter);
    }
  }

  private void SetNumberOnly(int paramInt1, int paramInt2)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt1));
    MyEditTextProperty localMyEditTextProperty;
    if (localMyEditText != null)
    {
      localMyEditTextProperty = localMyEditText.editproperty;
      if (paramInt2 <= 0)
        break label54;
    }
    label54: for (boolean bool = true; ; bool = false)
    {
      localMyEditTextProperty.bNumberOnly = bool;
      if (!localMyEditText.editproperty.bNumberOnly)
        break;
      localMyEditText.setInputType(2);
      return;
    }
    localMyEditText.setInputType(1);
  }

  private void SetText(int paramInt, String paramString)
  {
    Log.i("MyEditTextMgr", "CNativeEdit>>Before SetText(" + paramInt + ") string:" + paramString);
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
    if (localMyEditText != null)
    {
      localMyEditText.editproperty.strText = paramString;
      localMyEditText.setText(paramString);
      Log.i("MyEditTextMgr", "CNativeEdit>>Do SetText(" + paramInt + ") string:" + paramString);
    }
  }

  private void SetTextColor(int paramInt1, int paramInt2)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt1));
    if (localMyEditText != null)
    {
      localMyEditText.setTextColor(paramInt2);
      localMyEditText.editproperty.nTextColor = paramInt2;
    }
  }

  private void ShowEdit(int paramInt)
  {
    MyEditText localMyEditText = (MyEditText)s_mEditMap.get(Integer.valueOf(paramInt));
    if (localMyEditText != null)
      localMyEditText.setVisibility(0);
  }

  public static void ShowEditText(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 13;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  public void CloneEditByProperty(HashMap<Integer, MyEditTextProperty> paramHashMap)
  {
    if (paramHashMap != null)
    {
      Iterator localIterator = paramHashMap.entrySet().iterator();
      label186: 
      while (localIterator.hasNext())
      {
        Map.Entry localEntry = (Map.Entry)localIterator.next();
        int i = ((Integer)localEntry.getKey()).intValue();
        MyEditTextProperty localMyEditTextProperty = (MyEditTextProperty)localEntry.getValue();
        CreateEditText(localMyEditTextProperty.nStyle, localMyEditTextProperty.nEditAddr, i);
        AdjustLayout(i, localMyEditTextProperty.rect[0], localMyEditTextProperty.rect[1], localMyEditTextProperty.rect[2], localMyEditTextProperty.rect[3]);
        SetEditText(i, localMyEditTextProperty.strText);
        SetEditTextColor(i, localMyEditTextProperty.nTextColor);
        SetEditTextEnable(i, localMyEditTextProperty.bEnable);
        if (localMyEditTextProperty.bNumberOnly)
          SetEditTextNumberOnly(i, true);
        if (localMyEditTextProperty.bVisible)
          ShowEditText(i);
        while (true)
        {
          if (!localMyEditTextProperty.bNoneBorder)
            break label186;
          SetEditTextBorderNull(i);
          break;
          HideEditText(i);
        }
      }
    }
  }

  public void GetEditsProperty(HashMap<Integer, MyEditTextProperty> paramHashMap)
  {
    if (paramHashMap != null)
    {
      Iterator localIterator = s_mEditMap.entrySet().iterator();
      while (localIterator.hasNext())
      {
        Map.Entry localEntry = (Map.Entry)localIterator.next();
        paramHashMap.put(localEntry.getKey(), ((MyEditText)localEntry.getValue()).editproperty);
      }
    }
  }

  public void ProcessMsg(Message paramMessage)
  {
    switch (paramMessage.what)
    {
    default:
      return;
    case 10:
      CreateEdit(paramMessage.arg1, (int[])paramMessage.obj);
      return;
    case 11:
      AdjustEdit(paramMessage.arg1, (int[])paramMessage.obj);
      return;
    case 12:
      HideEdit(paramMessage.arg1);
      return;
    case 13:
      ShowEdit(paramMessage.arg1);
      return;
    case 14:
      SetText(paramMessage.arg1, (String)paramMessage.obj);
      return;
    case 15:
      SetEditEnable(paramMessage.arg1, paramMessage.arg2);
      return;
    case 16:
      ReleaseEdit(paramMessage.arg1);
      return;
    case 17:
      SetTextColor(paramMessage.arg1, paramMessage.arg2);
      return;
    case 18:
      SetNumberOnly(paramMessage.arg1, paramMessage.arg2);
      return;
    case 19:
      SetBorderStyleNull(paramMessage.arg1);
      return;
    case 20:
    }
    SetLimitText(paramMessage.arg1, paramMessage.arg2);
  }

  public native void onEditorTextChangedJNI(int paramInt, boolean paramBoolean);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MyEditTextMgr
 * JD-Core Version:    0.6.2
 */
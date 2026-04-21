package org.cocos2dx.lib;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.inputmethod.InputMethodManager;
import android.widget.TextView;
import android.widget.TextView.OnEditorActionListener;

class TextInputWraper
  implements TextWatcher, TextView.OnEditorActionListener
{
  private static final Boolean debug = Boolean.valueOf(false);
  private Cocos2dxGLSurfaceView mMainView;
  private String mOriginText;
  private String mText;

  public TextInputWraper(Cocos2dxGLSurfaceView paramCocos2dxGLSurfaceView)
  {
    this.mMainView = paramCocos2dxGLSurfaceView;
  }

  private void LogD(String paramString)
  {
    if (debug.booleanValue())
      Log.d("TextInputFilter", paramString);
  }

  private Boolean isFullScreenEdit()
  {
    return Boolean.valueOf(((InputMethodManager)this.mMainView.getTextField().getContext().getSystemService("input_method")).isFullscreenMode());
  }

  public void afterTextChanged(Editable paramEditable)
  {
    if (isFullScreenEdit().booleanValue())
      return;
    LogD("afterTextChanged: " + paramEditable);
    int i = paramEditable.length() - this.mText.length();
    if (i > 0)
    {
      String str = paramEditable.subSequence(this.mText.length(), paramEditable.length()).toString();
      this.mMainView.insertText(str);
      LogD("insertText(" + str + ")");
    }
    while (true)
    {
      this.mText = paramEditable.toString();
      return;
      while (i < 0)
      {
        this.mMainView.deleteBackward();
        LogD("deleteBackward");
        i++;
      }
    }
  }

  public void beforeTextChanged(CharSequence paramCharSequence, int paramInt1, int paramInt2, int paramInt3)
  {
    LogD("beforeTextChanged(" + paramCharSequence + ")start: " + paramInt1 + ",count: " + paramInt2 + ",after: " + paramInt3);
    this.mText = paramCharSequence.toString();
  }

  public boolean onEditorAction(TextView paramTextView, int paramInt, KeyEvent paramKeyEvent)
  {
    if ((this.mMainView.getTextField() == paramTextView) && (isFullScreenEdit().booleanValue()))
    {
      for (int i = this.mOriginText.length(); i > 0; i--)
      {
        this.mMainView.deleteBackward();
        LogD("deleteBackward");
      }
      String str1 = paramTextView.getText().toString();
      if ('\n' != str1.charAt(-1 + str1.length()))
        str1 = str1 + '\n';
      String str2 = str1;
      this.mMainView.insertText(str2);
      LogD("insertText(" + str2 + ")");
    }
    return false;
  }

  public void onTextChanged(CharSequence paramCharSequence, int paramInt1, int paramInt2, int paramInt3)
  {
  }

  public void setOriginText(String paramString)
  {
    this.mOriginText = paramString;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.TextInputWraper
 * JD-Core Version:    0.6.2
 */
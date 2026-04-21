package org.cocos2dx.lib;

import android.content.Context;
import android.opengl.GLSurfaceView;
import android.os.Handler;
import android.os.Message;
import android.util.AttributeSet;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.inputmethod.InputMethodManager;
import android.widget.RelativeLayout;
import android.widget.TextView;
import com.qqgame.mic.MicActivity;

public class Cocos2dxGLSurfaceView extends GLSurfaceView
{
  private static final int HANDLER_CLOSE_IME_KEYBOARD = 3;
  private static final int HANDLER_OPEN_IME_KEYBOARD = 2;
  private static final String TAG = Cocos2dxGLSurfaceView.class.getCanonicalName();
  private static final boolean debug;
  private static Handler handler;
  private static Cocos2dxGLSurfaceView mainView;
  private static TextInputWraper textInputWraper;
  private Cocos2dxRenderer mRenderer;
  private TextView mTextField;

  public Cocos2dxGLSurfaceView(Context paramContext)
  {
    super(paramContext);
    initView();
  }

  public Cocos2dxGLSurfaceView(Context paramContext, AttributeSet paramAttributeSet)
  {
    super(paramContext, paramAttributeSet);
    initView();
  }

  public static void closeIMEKeyboard()
  {
    Message localMessage = handler.obtainMessage();
    localMessage.what = 3;
    handler.sendMessage(localMessage);
  }

  private void dumpEvent(MotionEvent paramMotionEvent)
  {
    String[] arrayOfString = { "DOWN", "UP", "MOVE", "CANCEL", "OUTSIDE", "POINTER_DOWN", "POINTER_UP", "7?", "8?", "9?" };
    StringBuilder localStringBuilder = new StringBuilder();
    int i = paramMotionEvent.getAction();
    int j = i & 0xFF;
    localStringBuilder.append("event ACTION_").append(arrayOfString[j]);
    if ((j == 5) || (j == 6))
    {
      localStringBuilder.append("(pid ").append(i >> 8);
      localStringBuilder.append(")");
    }
    localStringBuilder.append("[");
    for (int k = 0; k < paramMotionEvent.getPointerCount(); k++)
    {
      localStringBuilder.append("#").append(k);
      localStringBuilder.append("(pid ").append(paramMotionEvent.getPointerId(k));
      localStringBuilder.append(")=").append((int)paramMotionEvent.getX(k));
      localStringBuilder.append(",").append((int)paramMotionEvent.getY(k));
      if (k + 1 < paramMotionEvent.getPointerCount())
        localStringBuilder.append(";");
    }
    localStringBuilder.append("]");
    Log.d(TAG, localStringBuilder.toString());
  }

  private String getContentText()
  {
    return this.mRenderer.getContentText();
  }

  private native void nativeCloseIMEKeyboard();

  private native void nativeOpenIMEKeyboard();

  public static void openIMEKeyboard()
  {
    Message localMessage = handler.obtainMessage();
    localMessage.what = 2;
    localMessage.obj = mainView.getContentText();
    handler.sendMessage(localMessage);
  }

  public void deleteBackward()
  {
    queueEvent(new Runnable()
    {
      public void run()
      {
        Cocos2dxGLSurfaceView.this.mRenderer.handleDeleteBackward();
      }
    });
  }

  public TextView getTextField()
  {
    return this.mTextField;
  }

  protected void initView()
  {
    Log.e("hlddz", "initView");
    this.mRenderer = new Cocos2dxRenderer();
    setFocusableInTouchMode(true);
    setRenderer(this.mRenderer);
    textInputWraper = new TextInputWraper(this);
    handler = new Handler()
    {
      public void handleMessage(Message paramAnonymousMessage)
      {
        switch (paramAnonymousMessage.what)
        {
        default:
        case 2:
          do
          {
            return;
            Cocos2dxGLSurfaceView.this.nativeOpenIMEKeyboard();
          }
          while ((Cocos2dxGLSurfaceView.this.mTextField == null) || (!Cocos2dxGLSurfaceView.this.mTextField.requestFocus()));
          Cocos2dxGLSurfaceView.this.mTextField.removeTextChangedListener(Cocos2dxGLSurfaceView.textInputWraper);
          Cocos2dxGLSurfaceView.this.mTextField.setText("");
          String str = (String)paramAnonymousMessage.obj;
          Cocos2dxGLSurfaceView.this.mTextField.append(str);
          Cocos2dxGLSurfaceView.textInputWraper.setOriginText(str);
          Cocos2dxGLSurfaceView.this.mTextField.addTextChangedListener(Cocos2dxGLSurfaceView.textInputWraper);
          ((InputMethodManager)Cocos2dxGLSurfaceView.mainView.getContext().getSystemService("input_method")).showSoftInput(Cocos2dxGLSurfaceView.this.mTextField, 0);
          Log.d("GLSurfaceView", "showSoftInput");
          return;
        case 3:
        }
        Cocos2dxGLSurfaceView.this.nativeCloseIMEKeyboard();
        ((InputMethodManager)Cocos2dxGLSurfaceView.mainView.getContext().getSystemService("input_method")).hideSoftInputFromWindow(MicActivity.s_layout.getWindowToken(), 0);
        Log.d("GLSurfaceView", "HideSoftInput");
      }
    };
    mainView = this;
  }

  public void insertText(final String paramString)
  {
    queueEvent(new Runnable()
    {
      public void run()
      {
        Cocos2dxGLSurfaceView.this.mRenderer.handleInsertText(paramString);
      }
    });
  }

  public boolean onKeyDown(final int paramInt, KeyEvent paramKeyEvent)
  {
    if (paramInt == 82)
    {
      Log.d("hlddz", "KeyEvent.KEYCODE_MENU");
      queueEvent(new Runnable()
      {
        public void run()
        {
          Log.d("hlddz", "KeyEvent.KEYCODE_MENU run");
          Log.d("hlddz", "KEYCODE_MENU mRenderer.handleKeyDown(kc)");
          Cocos2dxGLSurfaceView.this.mRenderer.handleKeyDown(paramInt);
        }
      });
      return super.onKeyDown(paramInt, paramKeyEvent);
    }
    if (paramInt == 4)
    {
      Log.d("hlddz", "KeyEvent.KEYCODE_BACK");
      queueEvent(new Runnable()
      {
        public void run()
        {
          Log.d("hlddz", "KeyEvent.KEYCODE_BACK run");
          Log.d("hlddz", "KEYCODE_BACK mRenderer.handleKeyDown(kc)");
          Cocos2dxGLSurfaceView.this.mRenderer.handleKeyDown(paramInt);
        }
      });
      return true;
    }
    return super.onKeyDown(paramInt, paramKeyEvent);
  }

  public void onOptionsItemSelected(final int paramInt)
  {
    Log.e("hlddz", "onOptionsItemSelected");
    queueEvent(new Runnable()
    {
      public void run()
      {
        Cocos2dxGLSurfaceView.this.mRenderer.handleonOptionsItemSelected(paramInt);
      }
    });
  }

  public void onPause()
  {
    Log.e("hlddz", "onPause");
    queueEvent(new Runnable()
    {
      public void run()
      {
        Cocos2dxGLSurfaceView.this.mRenderer.handleOnPause();
      }
    });
    super.onPause();
  }

  public void onResume()
  {
    super.onResume();
    Log.e("hlddz", "onResume");
    queueEvent(new Runnable()
    {
      public void run()
      {
        Cocos2dxGLSurfaceView.this.mRenderer.handleOnResume();
      }
    });
  }

  public void onTimer(final int paramInt)
  {
    queueEvent(new Runnable()
    {
      public void run()
      {
        Cocos2dxGLSurfaceView.this.mRenderer.handleOnTimer(paramInt);
      }
    });
  }

  public boolean onTouchEvent(MotionEvent paramMotionEvent)
  {
    int i = paramMotionEvent.getPointerCount();
    final int[] arrayOfInt = new int[i];
    final float[] arrayOfFloat1 = new float[i];
    final float[] arrayOfFloat2 = new float[i];
    for (int j = 0; j < i; j++)
    {
      arrayOfInt[j] = paramMotionEvent.getPointerId(j);
      arrayOfFloat1[j] = paramMotionEvent.getX(j);
      arrayOfFloat2[j] = paramMotionEvent.getY(j);
    }
    closeIMEKeyboard();
    switch (0xFF & paramMotionEvent.getAction())
    {
    case 4:
    case 5:
    case 6:
    default:
    case 0:
    case 2:
    case 1:
    case 3:
    }
    while (true)
    {
      return true;
      queueEvent(new Runnable()
      {
        public void run()
        {
          Cocos2dxGLSurfaceView.this.mRenderer.handleActionDown(this.val$idDown, this.val$xDown, this.val$yDown);
        }
      });
      continue;
      queueEvent(new Runnable()
      {
        public void run()
        {
          Cocos2dxGLSurfaceView.this.mRenderer.handleActionMove(arrayOfInt, arrayOfFloat1, arrayOfFloat2);
        }
      });
      continue;
      queueEvent(new Runnable()
      {
        public void run()
        {
          Cocos2dxGLSurfaceView.this.mRenderer.handleActionUp(this.val$idUp, this.val$xUp, this.val$yUp);
        }
      });
      continue;
      queueEvent(new Runnable()
      {
        public void run()
        {
          Cocos2dxGLSurfaceView.this.mRenderer.handleActionCancel(arrayOfInt, arrayOfFloat1, arrayOfFloat2);
        }
      });
    }
  }

  public void setTextField(TextView paramTextView)
  {
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxGLSurfaceView
 * JD-Core Version:    0.6.2
 */
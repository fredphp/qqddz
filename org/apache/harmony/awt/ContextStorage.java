package org.apache.harmony.awt;

import java.awt.GraphicsEnvironment;
import java.awt.Toolkit;
import org.apache.harmony.awt.datatransfer.DTK;

public final class ContextStorage
{
  private static final ContextStorage globalContext = new ContextStorage();
  private final Object contextLock = new ContextLock(null);
  private DTK dtk;
  private GraphicsEnvironment graphicsEnvironment;
  private volatile boolean shutdownPending = false;
  private Toolkit toolkit;

  public static Object getContextLock()
  {
    return getCurrentContext().contextLock;
  }

  private static ContextStorage getCurrentContext()
  {
    return globalContext;
  }

  public static DTK getDTK()
  {
    return getCurrentContext().dtk;
  }

  public static Toolkit getDefaultToolkit()
  {
    return getCurrentContext().toolkit;
  }

  public static GraphicsEnvironment getGraphicsEnvironment()
  {
    return getCurrentContext().graphicsEnvironment;
  }

  public static void setDTK(DTK paramDTK)
  {
    getCurrentContext().dtk = paramDTK;
  }

  public static void setDefaultToolkit(Toolkit paramToolkit)
  {
    getCurrentContext().toolkit = paramToolkit;
  }

  public static void setGraphicsEnvironment(GraphicsEnvironment paramGraphicsEnvironment)
  {
    getCurrentContext().graphicsEnvironment = paramGraphicsEnvironment;
  }

  public static boolean shutdownPending()
  {
    return getCurrentContext().shutdownPending;
  }

  void shutdown()
  {
  }

  private class ContextLock
  {
    private ContextLock()
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.ContextStorage
 * JD-Core Version:    0.6.2
 */
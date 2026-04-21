package org.apache.harmony.awt.datatransfer;

public class DataTransferThread extends Thread
{
  private final DTK dtk;

  public DataTransferThread(DTK paramDTK)
  {
    super("AWT-DataTransferThread");
    setDaemon(true);
    this.dtk = paramDTK;
  }

  // ERROR //
  public void run()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 19	org/apache/harmony/awt/datatransfer/DataTransferThread:dtk	Lorg/apache/harmony/awt/datatransfer/DTK;
    //   6: invokevirtual 26	org/apache/harmony/awt/datatransfer/DTK:initDragAndDrop	()V
    //   9: aload_0
    //   10: invokevirtual 31	java/lang/Object:notifyAll	()V
    //   13: aload_0
    //   14: monitorexit
    //   15: aload_0
    //   16: getfield 19	org/apache/harmony/awt/datatransfer/DataTransferThread:dtk	Lorg/apache/harmony/awt/datatransfer/DTK;
    //   19: invokevirtual 34	org/apache/harmony/awt/datatransfer/DTK:runEventLoop	()V
    //   22: return
    //   23: astore_1
    //   24: aload_0
    //   25: invokevirtual 31	java/lang/Object:notifyAll	()V
    //   28: aload_1
    //   29: athrow
    //   30: astore_2
    //   31: aload_0
    //   32: monitorexit
    //   33: aload_2
    //   34: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   2	9	23	finally
    //   9	15	30	finally
    //   24	30	30	finally
    //   31	33	30	finally
  }

  public void start()
  {
    try
    {
      super.start();
      try
      {
        wait();
        return;
      }
      catch (InterruptedException localInterruptedException)
      {
        throw new RuntimeException(localInterruptedException);
      }
    }
    finally
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.DataTransferThread
 * JD-Core Version:    0.6.2
 */
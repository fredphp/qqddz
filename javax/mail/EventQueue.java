package javax.mail;

import java.util.Vector;
import javax.mail.event.MailEvent;

class EventQueue
  implements Runnable
{
  private QueueElement head = null;
  private Thread qThread = new Thread(this, "JavaMail-EventQueue");
  private QueueElement tail = null;

  public EventQueue()
  {
    this.qThread.setDaemon(true);
    this.qThread.start();
  }

  private QueueElement dequeue()
    throws InterruptedException
  {
    while (true)
    {
      try
      {
        if (this.tail != null)
        {
          QueueElement localQueueElement = this.tail;
          this.tail = localQueueElement.prev;
          if (this.tail == null)
          {
            this.head = null;
            localQueueElement.next = null;
            localQueueElement.prev = null;
            return localQueueElement;
          }
        }
        else
        {
          wait();
          continue;
        }
      }
      finally
      {
      }
      this.tail.next = null;
    }
  }

  public void enqueue(MailEvent paramMailEvent, Vector paramVector)
  {
    try
    {
      QueueElement localQueueElement = new QueueElement(paramMailEvent, paramVector);
      if (this.head == null)
      {
        this.head = localQueueElement;
        this.tail = localQueueElement;
      }
      while (true)
      {
        notifyAll();
        return;
        localQueueElement.next = this.head;
        this.head.prev = localQueueElement;
        this.head = localQueueElement;
      }
    }
    finally
    {
    }
  }

  public void run()
  {
    try
    {
      QueueElement localQueueElement = dequeue();
      if (localQueueElement == null)
        return;
      MailEvent localMailEvent = localQueueElement.event;
      Vector localVector = localQueueElement.vector;
      int i = 0;
      while (true)
      {
        int j = localVector.size();
        if (i >= j)
          break;
        try
        {
          localMailEvent.dispatch(localVector.elementAt(i));
          i++;
        }
        catch (Throwable localThrowable)
        {
          boolean bool;
          do
            bool = localThrowable instanceof InterruptedException;
          while (!bool);
          return;
        }
      }
    }
    catch (InterruptedException localInterruptedException)
    {
    }
  }

  void stop()
  {
    if (this.qThread != null)
    {
      this.qThread.interrupt();
      this.qThread = null;
    }
  }

  static class QueueElement
  {
    MailEvent event = null;
    QueueElement next = null;
    QueueElement prev = null;
    Vector vector = null;

    QueueElement(MailEvent paramMailEvent, Vector paramVector)
    {
      this.event = paramMailEvent;
      this.vector = paramVector;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.EventQueue
 * JD-Core Version:    0.6.2
 */
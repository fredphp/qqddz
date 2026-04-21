package javax.mail.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import javax.mail.internet.SharedInputStream;

public class SharedFileInputStream extends BufferedInputStream
  implements SharedInputStream
{
  private static int defaultBufferSize = 2048;
  protected long bufpos;
  protected int bufsize;
  protected long datalen;
  protected RandomAccessFile in;
  private boolean master = true;
  private SharedFile sf;
  protected long start = 0L;

  public SharedFileInputStream(File paramFile)
    throws IOException
  {
    this(paramFile, defaultBufferSize);
  }

  public SharedFileInputStream(File paramFile, int paramInt)
    throws IOException
  {
    super(null);
    if (paramInt <= 0)
      throw new IllegalArgumentException("Buffer size <= 0");
    init(new SharedFile(paramFile), paramInt);
  }

  public SharedFileInputStream(String paramString)
    throws IOException
  {
    this(paramString, defaultBufferSize);
  }

  public SharedFileInputStream(String paramString, int paramInt)
    throws IOException
  {
    super(null);
    if (paramInt <= 0)
      throw new IllegalArgumentException("Buffer size <= 0");
    init(new SharedFile(paramString), paramInt);
  }

  private SharedFileInputStream(SharedFile paramSharedFile, long paramLong1, long paramLong2, int paramInt)
  {
    super(null);
    this.master = false;
    this.sf = paramSharedFile;
    this.in = paramSharedFile.open();
    this.start = paramLong1;
    this.bufpos = paramLong1;
    this.datalen = paramLong2;
    this.bufsize = paramInt;
    this.buf = new byte[paramInt];
  }

  private void ensureOpen()
    throws IOException
  {
    if (this.in == null)
      throw new IOException("Stream closed");
  }

  private void fill()
    throws IOException
  {
    if (this.markpos < 0)
    {
      this.pos = 0;
      this.bufpos += this.count;
    }
    while (true)
    {
      this.count = this.pos;
      this.in.seek(this.bufpos + this.pos);
      int j = this.buf.length - this.pos;
      if (this.bufpos - this.start + this.pos + j > this.datalen)
        j = (int)(this.datalen - (this.bufpos - this.start + this.pos));
      int k = this.in.read(this.buf, this.pos, j);
      if (k > 0)
        this.count = (k + this.pos);
      return;
      if (this.pos >= this.buf.length)
        if (this.markpos > 0)
        {
          int m = this.pos - this.markpos;
          System.arraycopy(this.buf, this.markpos, this.buf, 0, m);
          this.pos = m;
          this.bufpos += this.markpos;
          this.markpos = 0;
        }
        else if (this.buf.length >= this.marklimit)
        {
          this.markpos = -1;
          this.pos = 0;
          this.bufpos += this.count;
        }
        else
        {
          int i = 2 * this.pos;
          if (i > this.marklimit)
            i = this.marklimit;
          byte[] arrayOfByte = new byte[i];
          System.arraycopy(this.buf, 0, arrayOfByte, 0, this.pos);
          this.buf = arrayOfByte;
        }
    }
  }

  private int in_available()
    throws IOException
  {
    return (int)(this.start + this.datalen - (this.bufpos + this.count));
  }

  private void init(SharedFile paramSharedFile, int paramInt)
    throws IOException
  {
    this.sf = paramSharedFile;
    this.in = paramSharedFile.open();
    this.start = 0L;
    this.datalen = this.in.length();
    this.bufsize = paramInt;
    this.buf = new byte[paramInt];
  }

  private int read1(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i = this.count - this.pos;
    if (i <= 0)
    {
      fill();
      i = this.count - this.pos;
      if (i <= 0)
        return -1;
    }
    if (i < paramInt2);
    for (int j = i; ; j = paramInt2)
    {
      System.arraycopy(this.buf, this.pos, paramArrayOfByte, paramInt1, j);
      this.pos = (j + this.pos);
      return j;
    }
  }

  public int available()
    throws IOException
  {
    try
    {
      ensureOpen();
      int i = this.count - this.pos;
      int j = in_available();
      int k = i + j;
      return k;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void close()
    throws IOException
  {
    if (this.in == null)
      return;
    try
    {
      if (this.master)
        this.sf.forceClose();
      while (true)
      {
        return;
        this.sf.close();
      }
    }
    finally
    {
      this.sf = null;
      this.in = null;
      this.buf = null;
    }
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    close();
  }

  public long getPosition()
  {
    if (this.in == null)
      throw new RuntimeException("Stream closed");
    return this.bufpos + this.pos - this.start;
  }

  public void mark(int paramInt)
  {
    try
    {
      this.marklimit = paramInt;
      this.markpos = this.pos;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public boolean markSupported()
  {
    return true;
  }

  public InputStream newStream(long paramLong1, long paramLong2)
  {
    if (this.in == null)
      throw new RuntimeException("Stream closed");
    if (paramLong1 < 0L)
      throw new IllegalArgumentException("start < 0");
    if (paramLong2 == -1L)
      paramLong2 = this.datalen;
    return new SharedFileInputStream(this.sf, this.start + (int)paramLong1, (int)(paramLong2 - paramLong1), this.bufsize);
  }

  public int read()
    throws IOException
  {
    try
    {
      ensureOpen();
      if (this.pos >= this.count)
      {
        fill();
        int m = this.pos;
        int n = this.count;
        if (m < n);
      }
      int j;
      for (int k = -1; ; k = j & 0xFF)
      {
        return k;
        byte[] arrayOfByte = this.buf;
        int i = this.pos;
        this.pos = (i + 1);
        j = arrayOfByte[i];
      }
    }
    finally
    {
    }
  }

  public int read(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    try
    {
      ensureOpen();
      if ((paramInt1 | paramInt2 | paramInt1 + paramInt2 | paramArrayOfByte.length - (paramInt1 + paramInt2)) < 0)
        throw new IndexOutOfBoundsException();
    }
    finally
    {
    }
    int i;
    if (paramInt2 == 0)
      i = 0;
    label98: 
    while (true)
    {
      return i;
      i = read1(paramArrayOfByte, paramInt1, paramInt2);
      if (i > 0)
        while (true)
        {
          if (i >= paramInt2)
            break label98;
          int j = read1(paramArrayOfByte, paramInt1 + i, paramInt2 - i);
          if (j <= 0)
            break;
          i += j;
        }
    }
  }

  public void reset()
    throws IOException
  {
    try
    {
      ensureOpen();
      if (this.markpos < 0)
        throw new IOException("Resetting to invalid mark");
    }
    finally
    {
    }
    this.pos = this.markpos;
  }

  public long skip(long paramLong)
    throws IOException
  {
    long l1 = 0L;
    while (true)
    {
      long l2;
      try
      {
        ensureOpen();
        if (paramLong <= l1)
          return l1;
        l2 = this.count - this.pos;
        if (l2 <= l1)
        {
          fill();
          l2 = this.count - this.pos;
          if (l2 <= l1)
            continue;
          break label90;
          this.pos = ((int)(l1 + this.pos));
          continue;
        }
      }
      finally
      {
      }
      label90: 
      while (l2 >= paramLong)
      {
        l1 = paramLong;
        break;
      }
      l1 = l2;
    }
  }

  static class SharedFile
  {
    private int cnt;
    private RandomAccessFile in;

    SharedFile(File paramFile)
      throws IOException
    {
      this.in = new RandomAccessFile(paramFile, "r");
    }

    SharedFile(String paramString)
      throws IOException
    {
      this.in = new RandomAccessFile(paramString, "r");
    }

    public void close()
      throws IOException
    {
      try
      {
        if (this.cnt > 0)
        {
          int i = -1 + this.cnt;
          this.cnt = i;
          if (i <= 0)
            this.in.close();
        }
        return;
      }
      finally
      {
      }
    }

    protected void finalize()
      throws Throwable
    {
      super.finalize();
      this.in.close();
    }

    public void forceClose()
      throws IOException
    {
      try
      {
        if (this.cnt > 0)
        {
          this.cnt = 0;
          this.in.close();
        }
        while (true)
        {
          return;
          try
          {
            this.in.close();
          }
          catch (IOException localIOException)
          {
          }
        }
      }
      finally
      {
      }
    }

    public RandomAccessFile open()
    {
      this.cnt = (1 + this.cnt);
      return this.in;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.util.SharedFileInputStream
 * JD-Core Version:    0.6.2
 */
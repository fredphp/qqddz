package org.apache.harmony.awt.datatransfer;

import java.awt.datatransfer.DataFlavor;
import java.util.Comparator;

public class FlavorsComparator
  implements Comparator<DataFlavor>
{
  public int compare(DataFlavor paramDataFlavor1, DataFlavor paramDataFlavor2)
  {
    int i = -1;
    if ((!paramDataFlavor1.isFlavorTextType()) && (!paramDataFlavor2.isFlavorTextType()))
      i = 0;
    do
    {
      do
        return i;
      while ((!paramDataFlavor1.isFlavorTextType()) && (paramDataFlavor2.isFlavorTextType()));
      if ((paramDataFlavor1.isFlavorTextType()) && (!paramDataFlavor2.isFlavorTextType()))
        return 1;
    }
    while (DataFlavor.selectBestTextFlavor(new DataFlavor[] { paramDataFlavor1, paramDataFlavor2 }) == paramDataFlavor1);
    return 1;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.FlavorsComparator
 * JD-Core Version:    0.6.2
 */
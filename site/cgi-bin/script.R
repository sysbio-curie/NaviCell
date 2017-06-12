# get command line arguments
args <- commandArgs(TRUE)
input_file = args[1]
output_file = args[2]

# read data
read.table(input_file) -> data
nb_row <- dim(data)[1]
res <- NULL

# calculate hypergeometric p-value for each entry
for ( i in 1:nb_row ) {
    nbS <- data[i,1]
    sizeS <- data[i,2]
    nbU <- data[i,3]
    sizeU <- data[i,4]
    # fixme: in some cases the sample size is greater than the universe size, which is not possible
    if (sizeS > sizeU) {
        sizeS = sizeU
    }
    res[i] <- phyper(nbS - 1, nbU, sizeU - nbU, sizeS, lower.tail=F)
}

# write out p-values
write.table(res, file = output_file, row.names=F, col.names=F, quote=F)

